import winston from 'winston';
import { expect } from 'chai';
import dotenv from 'dotenv';
import {
    DiscordTransport,
    BotHandler,
    WebhookHandler
} from '../dist/winston-transport-discord';

/*
 * Bot Tests
 */
describe( 'w/ bot handler', () => {

    it( 'initializes from options', () => {
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
                library: 'winston-transport-discord',
                context: 'unit test w/ bots',
                test: 'it: initializes from options'
            }
        });

        expect( transport.discordHandler ).to.not.be.undefined;
        expect( transport.discordHandler ).to.be.an.instanceof( BotHandler );
    });

    it( 'initializes from environment variables', () => {
        dotenv.config({ path: '.env.bot' });

        const transport = new DiscordTransport({
            metadata: {
                library: 'winston-transport-discord',
                context: 'unit test w/ bots',
                test: 'it: initializes from environment variables'
            }
        });

        expect( transport.discordHandler ).to.not.be.undefined;
        expect( transport.discordHandler ).to.be.an.instanceof( BotHandler );
    });

    it( 'sends an info log', () => {
        dotenv.config({ path: '.env.bot' });

        const transport = new DiscordTransport({
            metadata: {
                library: 'winston-transport-discord',
                context: 'integration test w/ bots',
                test: 'it: sends an info log'
            }
        });

        const logger = winston.createLogger({
            transports: [ transport ]
        });

        logger.log( 'info', 'This is the log message.' );
    });

    it( 'sends an error log', () => {
        dotenv.config({ path: '.env.bot' });

        const transport = new DiscordTransport({
            metadata: {
                library: 'winston-transport-discord',
                context: 'integration test w/ bots',
                test: 'it: sends an error log'
            }
        });

        const logger = winston.createLogger({
            transports: [ transport ]
        });

        const errorMessage = `This is the error message or stack trace.`;
        const error = new Error( errorMessage );
        logger.log( 'error', 'This is the log message.', error );
    });
});

/**
 * Webhook Tests
 */
describe( 'w/ webhook handler', () => {

    it( 'initializes from options', () => {
        const config = dotenv.config({ path: '.env.webhook' });
        const url = config.parsed!.DISCORD_LOGGING_WEBHOOK_URL;

        const transport = new DiscordTransport({
            discord: {
                webhook: {
                    url
                }
            },
            metadata: {
                library: 'winston-transport-discord',
                context: 'unit test w/ webhooks',
                test: 'it: initializes from options'
            }
        });

        expect( transport.discordHandler ).to.not.be.undefined;
        expect( transport.discordHandler ).to.be.an.instanceof( WebhookHandler );
    });

    it( 'initializes from environment variables', () => {
        dotenv.config({ path: '.env.webhook' });

        const transport = new DiscordTransport({
            metadata: {
                library: 'winston-transport-discord',
                context: 'unit test w/ webhooks',
                test: 'it: initializes from environment variables'
            }
        });

        expect( transport.discordHandler ).to.not.be.undefined;
        expect( transport.discordHandler ).to.be.an.instanceof( WebhookHandler );
    });

    it( 'sends an info log', () => {
        dotenv.config({ path: '.env.webhook' });

        const transport = new DiscordTransport({
            metadata: {
                library: 'winston-transport-discord',
                context: 'integration test w/ webhooks',
                test: 'it: sends an info log'
            }
        });

        const logger = winston.createLogger({
            transports: [ transport ]
        });

        logger.log( 'info', 'This is the log message.' );
    });

    it( 'sends an error log', () => {
        dotenv.config({ path: '.env.webhook' });

        const transport = new DiscordTransport({
            metadata: {
                library: 'winston-transport-discord',
                context: 'integration test w/ webhooks',
                test: 'it: sends an error log'
            }
        });

        const logger = winston.createLogger({
            transports: [ transport ]
        });

        const errorMessage = `This is the error message or stack trace.`;
        const error = new Error( errorMessage );
        logger.log( 'error', 'This is the log message.', error );
    });
});