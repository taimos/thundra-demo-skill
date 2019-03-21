import { AlexaTest, LaunchRequestBuilder, SkillSettings } from 'ask-sdk-test';
import { describe } from 'mocha';
import { env } from 'process';
import { handler as skillHandler } from '../lib/';

// initialize the testing framework
const skillSettings : SkillSettings = {
    appId: 'amzn1.ask.skill.DEMO',
    userId: 'amzn1.ask.account.SOMEUSERID',
    deviceId: 'amzn1.ask.device.SOMEDEVICEID',
    locale: 'de-DE',
};

const alexaTest = new AlexaTest(skillHandler, skillSettings);
alexaTest.withDynamoDBPersistence(env.TABLE_NAME);

describe('Test LaunchRequest', () => {
    'use strict';

    alexaTest.test([
        {
            request: new LaunchRequestBuilder(skillSettings).build(),
            says: 'Hello, world! I am not allowed to view your profile.',
            shouldEndSession: true,
        },
    ], 'should start correctly withoput profile');

    alexaTest.test([
        {
            request: new LaunchRequestBuilder(skillSettings).build(),
            says: 'Hello, John Smith. This is your visit number 1',
            withProfile: {
                name: 'John Smith',
            },
            shouldEndSession: true,
        },
    ], 'should start correctly with profile on first launch');

    alexaTest.test([
        {
            request: new LaunchRequestBuilder(skillSettings).build(),
            says: 'Hello, John Smith. This is your visit number 2',
            withProfile: {
                name: 'John Smith',
            },
            withStoredAttributes: {
                visitCount : 1,
            },
            shouldEndSession: true,
        },
    ], 'should start correctly with profile on consecutive launch');

});
