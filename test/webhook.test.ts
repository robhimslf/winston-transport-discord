import winston from 'winston';
import { expect } from 'chai';
import dotenv from 'dotenv';
import DiscordTransport, { WebhookHandler } from '../dist';

describe( 'winston-discord w/ webhooks', () => {

    it( 'initializes with explicit options', () => {
        const config = dotenv.config({ path: '.env.webhook' });
        const url = config.parsed!.url;

        const transport = new DiscordTransport({
            discord: {
                webhook: {
                    url
                }
            },
            metadata: {
                service: 'winston-discord-transport unit tests',
                context: 'winston-discord: webhooks -> logs with explicit options'
            }
        });

        expect( transport.discordHandler ).to.not.be.undefined;
        expect( transport.discordHandler ).to.be.an.instanceof( WebhookHandler );
    });

    it( 'initializes with environment variables', () => {
        dotenv.config({ path: '.env.webhook' });

        const transport = new DiscordTransport({
            metadata: {
                service: 'winston-discord-transport unit tests',
                context: 'winston-discord: webhooks -> logs with environment variables'
            }
        });

        expect( transport.discordHandler ).to.not.be.undefined;
        expect( transport.discordHandler ).to.be.an.instanceof( WebhookHandler );
    });

    it( 'sends an integration test', () => {
        dotenv.config({ path: '.env.webhook' });

        const transport = new DiscordTransport({
            discord: {
                webhook: {
                    avatarUrl: 'https://mediaproxy.salon.com/width/1200/https://media.salon.com/2015/02/avatar_roleplayer.jpg'
                }
            },
            metadata: {
                service: 'winston-discord-transport unit tests',
                context: 'winston-discord: webhooks integration test'
            }
        });

        const logger = winston.createLogger({
            transports: [ transport ]
        });

        logger.info( `This is an automated integration test.` );
    });

    it( 'sends an integration test w/ error', () => {
        dotenv.config({ path: '.env.webhook' });

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