import AVFoundation
import Foundation

private struct NativePaceKeeperState {
  let runId: String
  let enabled: Bool
  let triggerType: String
  let triggerSeconds: Int
  let triggerMeters: Int
  let targetPaceSecondsPerKm: Double?
  let distanceMeters: Double
  let elapsedMs: Double
  let segmentStartedAt: Double
  let isPaused: Bool
  let isAppActive: Bool

  init?(payload: [String: Any]) {
    guard
      let runId = payload["runId"] as? String,
      let enabled = payload["enabled"] as? Bool,
      let triggerType = payload["triggerType"] as? String,
      let distanceMeters = payload["distanceMeters"] as? Double,
      let elapsedMs = payload["elapsedMs"] as? Double,
      let segmentStartedAt = payload["segmentStartedAt"] as? Double,
      let isPaused = payload["isPaused"] as? Bool,
      let isAppActive = payload["isAppActive"] as? Bool
    else {
      return nil
    }

    self.runId = runId
    self.enabled = enabled
    self.triggerType = triggerType
    self.triggerSeconds = payload["triggerSeconds"] as? Int ?? 0
    self.triggerMeters = payload["triggerMeters"] as? Int ?? 0
    self.targetPaceSecondsPerKm = payload["targetPaceSecondsPerKm"] as? Double
    self.distanceMeters = distanceMeters
    self.elapsedMs = elapsedMs
    self.segmentStartedAt = segmentStartedAt
    self.isPaused = isPaused
    self.isAppActive = isAppActive
  }
}

private final class NativePaceKeeperService: NSObject, AVSpeechSynthesizerDelegate {
  static let shared = NativePaceKeeperService()

  private let synthesizer = AVSpeechSynthesizer()
  private var keepAlivePlayer: AVAudioPlayer?
  private var timer: DispatchSourceTimer?
  private var state: NativePaceKeeperState?
  private var lastTimeCueIndex = 0
  private var lastDistanceCueIndex = 0

  private override init() {
    super.init()
    synthesizer.delegate = self
    synthesizer.usesApplicationAudioSession = true
  }

  func sync(payload: [String: Any]) {
    guard let nextState = NativePaceKeeperState(payload: payload) else {
      return
    }

    let previousState = state

    if previousState?.runId != nextState.runId {
      lastTimeCueIndex = 0
      lastDistanceCueIndex = 0
    }

    state = nextState

    guard nextState.enabled else {
      stop()
      return
    }

    if nextState.isPaused {
      pauseForRun()
      return
    }

    let appActivityChanged = previousState?.isAppActive != nextState.isAppActive

    if nextState.isAppActive {
      if keepAlivePlayer != nil {
        stopKeepAliveAudio(deactivateSession: !synthesizer.isSpeaking)
      }
    } else if appActivityChanged || keepAlivePlayer == nil {
      startKeepAliveAudioIfNeeded()
    }

    startTimerIfNeeded()
    tick()
  }

  func stop() {
    timer?.cancel()
    timer = nil
    stopSpeaking()
    stopKeepAliveAudio()
    state = nil
    lastTimeCueIndex = 0
    lastDistanceCueIndex = 0
  }

  private func pauseForRun() {
    timer?.cancel()
    timer = nil
    stopSpeaking()
    stopKeepAliveAudio()
  }

  private func startTimerIfNeeded() {
    guard timer == nil else {
      return
    }

    let timer = DispatchSource.makeTimerSource(queue: .main)
    timer.schedule(deadline: .now(), repeating: .seconds(1), leeway: .milliseconds(150))
    timer.setEventHandler { [weak self] in
      self?.tick()
    }
    timer.resume()
    self.timer = timer
  }

  private func tick() {
    guard let state, state.enabled, !state.isPaused else {
      return
    }

    let elapsedMs = currentElapsedMs(for: state)
    let distanceMeters = state.distanceMeters

    if state.triggerType == "time", state.triggerSeconds > 0 {
      let cueIndex = Int(floor(elapsedMs / Double(state.triggerSeconds * 1000)))
      guard cueIndex >= 1, cueIndex > lastTimeCueIndex else {
        return
      }
      lastTimeCueIndex = cueIndex
      speakCue(distanceMeters: distanceMeters, elapsedMs: elapsedMs, targetPaceSecondsPerKm: state.targetPaceSecondsPerKm)
      return
    }

    if state.triggerType == "distance", state.triggerMeters > 0 {
      let cueIndex = Int(floor(distanceMeters / Double(state.triggerMeters)))
      guard cueIndex >= 1, cueIndex > lastDistanceCueIndex else {
        return
      }
      lastDistanceCueIndex = cueIndex
      speakCue(distanceMeters: distanceMeters, elapsedMs: elapsedMs, targetPaceSecondsPerKm: state.targetPaceSecondsPerKm)
    }
  }

  private func currentElapsedMs(for state: NativePaceKeeperState) -> Double {
    state.elapsedMs + max(0, Date().timeIntervalSince1970 * 1000 - state.segmentStartedAt)
  }

  private func speakCue(distanceMeters: Double, elapsedMs: Double, targetPaceSecondsPerKm: Double?) {
    if state?.isAppActive == false {
      stopKeepAliveAudio(deactivateSession: true)
    }

    configureSpeechAudioSession()

    if synthesizer.isSpeaking {
      synthesizer.stopSpeaking(at: .immediate)
    }

    let utterance = AVSpeechUtterance(string: buildSpeechText(distanceMeters: distanceMeters, elapsedMs: elapsedMs, targetPaceSecondsPerKm: targetPaceSecondsPerKm))
    utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.95
    utterance.pitchMultiplier = 1.0
    synthesizer.speak(utterance)
  }

  private func buildSpeechText(distanceMeters: Double, elapsedMs: Double, targetPaceSecondsPerKm: Double?) -> String {
    let distanceKm = distanceMeters / 1000
    let distanceText = String(format: "%.1f", distanceKm)

    guard distanceMeters >= 10 else {
      let totalSeconds = max(0, Int(floor(elapsedMs / 1000)))
      let mins = totalSeconds / 60
      let secs = totalSeconds % 60
      return "Time. \(mins):\(String(format: "%02d", secs)). Distance. \(distanceText) kilometres. Gathering pace data."
    }

    let currentPaceSecondsPerKm = (elapsedMs / 1000) / max(distanceKm, 0.001)
    let paceMin = Int(floor(currentPaceSecondsPerKm / 60))
    let paceSec = Int(round(currentPaceSecondsPerKm.truncatingRemainder(dividingBy: 60)))

    var text = "Distance. \(distanceText) kilometres. Pace. \(paceMin) \(String(format: "%02d", paceSec)) per kilometre."

    if let targetPaceSecondsPerKm {
      let diff = targetPaceSecondsPerKm - currentPaceSecondsPerKm
      let diffAbs = abs(Int(round(diff)))
      if diffAbs > 2 {
        text += " Target. \(diffAbs) seconds \(diff > 0 ? "ahead of" : "behind") target."
      } else {
        text += " Target. On target."
      }
    } else {
      let totalSeconds = max(0, Int(floor(elapsedMs / 1000)))
      let mins = totalSeconds / 60
      let secs = totalSeconds % 60
      text += " Time. \(mins):\(String(format: "%02d", secs))."
    }

    return text
  }

  private func configureKeepAliveAudioSession() {
    let session = AVAudioSession.sharedInstance()
    try? session.setCategory(.playback, mode: .default, options: [.mixWithOthers])
    try? session.setActive(true)
  }

  private func configureSpeechAudioSession() {
    let session = AVAudioSession.sharedInstance()
    try? session.setCategory(
      .playback,
      mode: .voicePrompt,
      options: [.duckOthers, .interruptSpokenAudioAndMixWithOthers]
    )
    try? session.setActive(true)
  }

  private func finishSpeechAudioSession() {
    guard let state else {
      try? AVAudioSession.sharedInstance().setActive(false, options: [.notifyOthersOnDeactivation])
      return
    }

    try? AVAudioSession.sharedInstance().setActive(false, options: [.notifyOthersOnDeactivation])

    if state.isAppActive {
      return
    }

    DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { [weak self] in
      guard
        let self,
        let latestState = self.state,
        !latestState.isAppActive,
        !latestState.isPaused,
        !self.synthesizer.isSpeaking
      else {
        return
      }
      self.startKeepAliveAudioIfNeeded()
    }
  }

  private func startKeepAliveAudioIfNeeded() {
    configureKeepAliveAudioSession()

    if let keepAlivePlayer, keepAlivePlayer.isPlaying {
      return
    }

    guard let url = silentAudioURL() else {
      return
    }

    do {
      let player = try AVAudioPlayer(contentsOf: url)
      player.volume = 0
      player.numberOfLoops = -1
      player.prepareToPlay()
      player.play()
      keepAlivePlayer = player
    } catch {
      keepAlivePlayer = nil
    }
  }

  private func stopKeepAliveAudio(deactivateSession: Bool = true) {
    keepAlivePlayer?.stop()
    keepAlivePlayer = nil

    if deactivateSession {
      try? AVAudioSession.sharedInstance().setActive(false, options: [.notifyOthersOnDeactivation])
    }
  }

  private func stopSpeaking() {
    if synthesizer.isSpeaking {
      synthesizer.stopSpeaking(at: .immediate)
    }
  }

  private func silentAudioURL() -> URL? {
    let directory = FileManager.default.temporaryDirectory
    let url = directory.appendingPathComponent("helm-pacekeeper-silence.wav")

    if FileManager.default.fileExists(atPath: url.path) {
      return url
    }

    let sampleRate = 8_000
    let durationSeconds = 1
    let channelCount = 1
    let bitsPerSample = 16
    let bytesPerSample = bitsPerSample / 8
    let frameCount = sampleRate * durationSeconds
    let dataSize = frameCount * channelCount * bytesPerSample

    var data = Data()
    data.append(contentsOf: Array("RIFF".utf8))
    data.append(UInt32(36 + dataSize).littleEndianData)
    data.append(contentsOf: Array("WAVE".utf8))
    data.append(contentsOf: Array("fmt ".utf8))
    data.append(UInt32(16).littleEndianData)
    data.append(UInt16(1).littleEndianData)
    data.append(UInt16(channelCount).littleEndianData)
    data.append(UInt32(sampleRate).littleEndianData)
    data.append(UInt32(sampleRate * channelCount * bytesPerSample).littleEndianData)
    data.append(UInt16(channelCount * bytesPerSample).littleEndianData)
    data.append(UInt16(bitsPerSample).littleEndianData)
    data.append(contentsOf: Array("data".utf8))
    data.append(UInt32(dataSize).littleEndianData)
    data.append(Data(count: dataSize))

    do {
      try data.write(to: url, options: .atomic)
      return url
    } catch {
      return nil
    }
  }

  func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
    finishSpeechAudioSession()
  }

  func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
    finishSpeechAudioSession()
  }
}

private extension FixedWidthInteger {
  var littleEndianData: Data {
    var value = littleEndian
    return Data(bytes: &value, count: MemoryLayout<Self>.size)
  }
}

@objc(NativePaceKeeperModule)
final class NativePaceKeeperModule: NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool {
    true
  }

  @objc
  func sync(_ payload: NSDictionary) {
    let payload = payload as? [String: Any] ?? [:]
    DispatchQueue.main.async {
      NativePaceKeeperService.shared.sync(payload: payload)
    }
  }

  @objc
  func stop() {
    DispatchQueue.main.async {
      NativePaceKeeperService.shared.stop()
    }
  }
}
