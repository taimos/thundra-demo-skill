/*
 * Copyright (c) 2018. Taimos GmbH http://www.taimos.de
 */

import { DefaultApiClient, DynamoDbPersistenceAdapter, HandlerInput, SkillBuilders } from 'ask-sdk';
import { NamedIntentRequestHandler, PersistAttributesInterceptor } from 'ask-sdk-addon';
import { LambdaHandler } from 'ask-sdk-core/dist/skill/factory/BaseSkillFactory';
import { Response } from 'ask-sdk-model';
import { env } from 'process';

class LaunchRequestHandler extends NamedIntentRequestHandler {
    constructor() {
        super('LaunchRequest');
    }

    public async handle(handlerInput : HandlerInput) : Promise<Response> {
        const attributes = await handlerInput.attributesManager.getPersistentAttributes();
        attributes.visitCount = attributes.visitCount ? attributes.visitCount + 1 : 1;
        handlerInput.attributesManager.setPersistentAttributes(attributes);

        try {
            let name = '';
            if (attributes.name && attributes.profileDate > (new Date().getTime() - (5 * 86400 * 1000))) {
                name = attributes.name;
            } else {
                const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();
                name = await upsServiceClient.getProfileName();
                attributes.name = name;
                attributes.profileDate = new Date().getTime();
                handlerInput.attributesManager.setPersistentAttributes(attributes);
            }
            const speechText = `Hello, ${name}. This is your visit number ${attributes.visitCount}`;
            return handlerInput.responseBuilder.speak(speechText).getResponse();
        } catch (e) {
            return handlerInput.responseBuilder.speak('Hello, world! I am not allowed to view your profile.').getResponse();
        }
    }
}

export const handler : LambdaHandler = SkillBuilders.custom()
    .withPersistenceAdapter(new DynamoDbPersistenceAdapter({ tableName: env.TABLE_NAME }))
    .withApiClient(new DefaultApiClient())
    .addResponseInterceptors(new PersistAttributesInterceptor())
    .addRequestHandlers(
        new LaunchRequestHandler(),
    )
    .lambda();
