import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

export async function writeAndShareFile(
  filename: string,
  content: string,
  mimeType: string,
): Promise<void> {
  const file = new File(Paths.cache, filename);
  file.write(content);
  await shareAsync(file.uri, { mimeType });
}

export async function pickAndReadFile(): Promise<{ content: string; filename: string } | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/csv', 'text/comma-separated-values', '*/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  const file = new File(asset.uri);
  const content = await file.text();

  return { content, filename: asset.name };
}
