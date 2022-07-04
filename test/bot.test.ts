import winston from 'winston';
import { expect } from 'chai';
import dotenv from 'dotenv';
import DiscordTransport, { BotHandler } from '../dist';

describe( 'winston-discord w/ bots', () => {

    it( 'initializes with explicit options', () => {
        const config = dotenv.config({ path: '.env.bot' });
        const channel = config.parsed!.DISCORD_LOGGING_BOT_CHANNEL;
        const token = config.parsed!.DISCORD_LOGGING_BOT_TOKEN;

        const transport = new DiscordTransport({
            discord: {
                bot: {
                    channel,
                    token
                }
            },
            metadata: {
                service: 'winston-discord-transport unit tests',
                context: 'winston-discord: bots -> logs with explicit options'
            }
        });

        expect( transport.discordHandler ).to.not.be.undefined;
        expect( transport.discordHandler ).to.be.an.instanceof( BotHandler );
    });

    it( 'initializes with environment variables', () => {
        dotenv.config({ path: '.env.bot' });

        const transport = new DiscordTransport({
            metadata: {
                service: 'winston-discord-transport unit tests',
                context: 'winston-discord: bots -> logs with environment variables'
            }
        });

        expect( transport.discordHandler ).to.not.be.undefined;
        expect( transport.discordHandler ).to.be.an.instanceof( BotHandler );
    });

    it( 'sends an integration test', () => {
        dotenv.config({ path: '.env.bot' });

        const transport = new DiscordTransport({
            metadata: {
                service: 'winston-discord-transport unit tests',
                context: 'winston-discord: bots integration test'
            }
        });

        const logger = winston.createLogger({
            transports: [ transport ]
        });

        logger.info( `This is an automated integration test.` );
    });

    it( 'sends an integration test w/ error', () => {
        dotenv.config({ path: '.env.bot' });

        const transport = new DiscordTransport({
            metadata: {
                service: 'winston-discord-transport unit tests',
                context: 'winston-discord: webhooks integration test'
            }
        });

        const logger = winston.createLogger({
            transports: [ transport ]
        });

        const errorMessage = `Well that doesn't look healthy...`;
        const error = new Error( errorMessage );

        logger.error( `This is an automated integration test.`, error );
    })
});