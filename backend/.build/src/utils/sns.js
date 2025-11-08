"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = sendPushNotification;
exports.sendEmailNotification = sendEmailNotification;
const client_sns_1 = require("@aws-sdk/client-sns");
const snsClient = new client_sns_1.SNSClient({ region: process.env.REGION || 'us-east-1' });
const TOPIC_ARN = process.env.SNS_TOPIC_ARN || '';
// sends a push notification via SNS
// this gets triggered by dynamodb streams when requests are updated
// hack: using SNS for push notifications, could use firebase or onesignal later but this works
async function sendPushNotification(userId, title, message, requestId) {
    if (!TOPIC_ARN) {
        console.log('no SNS topic configured, skipping push notification');
        return; // fail silently if SNS isn't set up yet
    }
    try {
        // format the message for mobile push
        const snsMessage = JSON.stringify({
            default: message,
            GCM: JSON.stringify({
                notification: {
                    title,
                    body: message,
                    sound: 'default'
                },
                data: {
                    type: 'request_update',
                    requestId: requestId || '',
                    userId
                }
            }),
            APNS: JSON.stringify({
                aps: {
                    alert: {
                        title,
                        body: message
                    },
                    sound: 'default'
                },
                requestId: requestId || '',
                userId
            })
        });
        await snsClient.send(new client_sns_1.PublishCommand({
            TopicArn: TOPIC_ARN,
            Message: snsMessage,
            MessageStructure: 'json',
            Subject: title,
            MessageAttributes: {
                userId: {
                    DataType: 'String',
                    StringValue: userId
                }
            }
        }));
        console.log('sent push notification to user:', userId);
    }
    catch (error) {
        console.error('error sending push notification:', error);
        // don't throw - we don't want to break the stream processing
    }
}
// sends email via SNS (for users who prefer email notifications)
async function sendEmailNotification(email, subject, message) {
    if (!TOPIC_ARN) {
        return;
    }
    try {
        await snsClient.send(new client_sns_1.PublishCommand({
            TopicArn: TOPIC_ARN,
            Subject: subject,
            Message: message,
            MessageAttributes: {
                email: {
                    DataType: 'String',
                    StringValue: email
                }
            }
        }));
    }
    catch (error) {
        console.error('error sending email notification:', error);
    }
}
//# sourceMappingURL=sns.js.map