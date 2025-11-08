import { EventBridgeEvent } from 'aws-lambda';
export declare const processIoTEvent: (event: EventBridgeEvent<"iot-sensor", any>) => Promise<void>;
export declare const handleIoTCommand: (event: any) => Promise<void>;
//# sourceMappingURL=iot.d.ts.map