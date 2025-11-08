"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDynamoDBStream = void 0;
const sns_1 = require("../utils/sns");
const notifications_1 = require("../utils/notifications");
// this gets triggered automatically when dynamodb items are updated
// we use it to send push notifications when requests change
// this is the event-driven architecture - dynamodb streams -> lambda -> SNS
const processDynamoDBStream = async (event) => {
    console.log('processing dynamodb stream event:', event.Records.length, 'records');
    for (const record of event.Records) {
        // only process updates to request items
        if (!record.dynamodb?.NewImage)
            continue;
        const newImage = record.dynamodb.NewImage;
        const sk = newImage.SK?.S || '';
        // only care about request updates
        if (!sk.startsWith('request#'))
            continue;
        const requestId = sk.replace('request#', '');
        const oldImage = record.dynamodb.OldImage;
        // check if status changed (compare old vs new)
        const oldStatus = oldImage?.status?.S;
        const newStatus = newImage.status?.S;
        const userId = newImage.userId?.S;
        const acceptedBy = newImage.acceptedBy?.S;
        const title = newImage.title?.S || 'Request';
        console.log('request updated:', requestId, 'status:', oldStatus, '->', newStatus);
        // when request is accepted, notify the requester
        if (newStatus === 'accepted' && oldStatus !== 'accepted' && userId) {
            const message = `Good news! ${acceptedBy || 'Someone'} is on the way to help you with "${title}"`;
            // create in-app notification
            await (0, notifications_1.createNotification)(userId, 'request_accepted', 'Your request has been accepted!', message, requestId, { acceptedBy });
            // send push notification via SNS (this is what triggers mobile push)
            await (0, sns_1.sendPushNotification)(userId, 'Request Accepted!', message, requestId);
        }
        // when request is completed, notify both parties
        if (newStatus === 'completed' && oldStatus !== 'completed') {
            if (userId) {
                const message = `Your request "${title}" has been completed!`;
                await (0, notifications_1.createNotification)(userId, 'request_completed', 'Request completed!', message, requestId);
                await (0, sns_1.sendPushNotification)(userId, 'Request Completed', message, requestId);
            }
            if (acceptedBy) {
                const message = `The request "${title}" you helped with has been completed.`;
                await (0, notifications_1.createNotification)(acceptedBy, 'request_completed', 'Request completed!', message, requestId);
                await (0, sns_1.sendPushNotification)(acceptedBy, 'Request Completed', message, requestId);
            }
        }
        // when request is cancelled, notify the volunteer
        if (newStatus === 'cancelled' && oldStatus !== 'cancelled' && acceptedBy) {
            const message = `The request "${title}" has been cancelled.`;
            await (0, notifications_1.createNotification)(acceptedBy, 'request_cancelled', 'Request cancelled', message, requestId);
            await (0, sns_1.sendPushNotification)(acceptedBy, 'Request Cancelled', message, requestId);
        }
    }
    console.log('finished processing stream');
};
exports.processDynamoDBStream = processDynamoDBStream;
//# sourceMappingURL=streams.js.map