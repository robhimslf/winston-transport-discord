import TransportStream from 'winston-transport';
import type { DiscordTransportHandler, DiscordTransportOptions } from './types';
import { BotHandler, WebhookHandler } from './handlers';

/**
 * Winston transport providing bot- or webhook-based logging to Discord.
 */
export default class DiscordTransport extends TransportStream {

    /**
     * Discord transport handler initialized from the provided options.
     */
    readonly discordHandler: DiscordTransportHandler | undefined;

    /**
     * Whether to flush any unsent log entries prior to application exit.
     */
    //private readonly flushOnExit: boolean;

    /**
     * Metadata to include in every Discord log entry.
     */
    private readonly metadata: {[key: string]: string} = {};

    /**
     * Prepares a Winston transport for Discord logging.
     * 
     * @param {Partial<DiscordTransportOptions>} options 
     */
    constructor( options?: Partial<DiscordTransportOptions> ) {
        super({
            level: options?.level || 'info',
            silent: options?.silent || false
        });

        //this.flushOnExit = options?.flushOnExit || true;
        if ( options?.metadata )
            this.metadata = options.metadata;

        this.discordHandler = this.getHandler( options );
    }

    /**
     * Log method exposed to Winston.
     * 
     * @param {any} info 
     * @param {function} next 
     * @returns {void}
     */
    log( info: any, next: () => void ) {
        setImmediate( () => this.emit( 'logged', info ));

        if ( this.silent )
            return next();

        if ( this.discordHandler )
            this.discordHandler.log( info, this.metadata, next );
    }

    /**
     * Determines the appropriate handler to use from transport options and
     * environment variables. *Prefers webhooks.*
     * 
     * @param {Partial<DiscordTransportOptions>} options 
     * @returns {DiscordTransportHandler | undefined}
     */
    private getHandler( options?: Partial<DiscordTransportOptions> )
        : DiscordTransportHandler | undefined {
        
        let handler: DiscordTransportHandler | undefined;

        try {

            // Webhook (Preferred)
            const webhookUrl =
                options?.discord?.webhook?.url ||
                process.env.DISCORD_LOGGING_WEBHOOK_URL;

            const avatarUrl =
                options?.discord?.webhook?.avatarUrl;

            if ( webhookUrl )
                handler = new WebhookHandler( webhookUrl, avatarUrl );

            // Bot
            if ( !handler ) {

                const botChannel =
                    options?.discord?.bot?.channel ||
                    process.env.DISCORD_LOGGING_BOT_CHANNEL;
                
                const botToken =
                    options?.discord?.bot?.token ||
                    process.env.DISCORD_LOGGING_BOT_TOKEN;

                if ( botChannel && botToken )
                    handler = new BotHandler( botToken, botChannel );
            }

            if ( !handler )
                throw new Error( 'No webhook or bot configurations found in transport options or environment variables.' );
        } catch ( err ) {
            console.error( 'Failed determining Discord transport handler.', err );
        }

        return handler;
    }
}