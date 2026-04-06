#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(NativePaceKeeperModule, NSObject)

RCT_EXTERN_METHOD(sync:(NSDictionary *)payload)
RCT_EXTERN_METHOD(stop)

@end
