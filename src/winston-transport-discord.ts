import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import {
    EmbedField,
    MessageEmbed,
    WebhookClient
} from 'discord.js';
import tripleBeam from 'triple-beam';
import os from 'os';
import type { TransportStreamOptions } from 'winston-transport';
import TransportStream from 'winston-transport';

/**
 * Interface contract of a transport handler.
 */
export interface DiscordTransportHandler {

    /**
     * This handler's specific type.
     */
    readonly type: 'bot' | 'webhook';

    /**
     * Implementation of this handler's logging mechanism.
     * 
     * @param {any} info
     * @param {function} next
     */
    log: ( info: any, meta: any, next: () => void ) => void;
}

/**
 * Defines embed color properties used by the Discord transport.
 */
export interface DiscordTransportColorOptions {
    debug?: number;
    error?: number;
    info?: number;
    silly?: number;
    verbose?: number;
    warn?: number;
}

/**
 * Defines configurable properties of the Discord transport.
 */
export interface DiscordTransportOptions extends TransportStreamOptions {

    /**
     * Discord-specific transport options.
     */
    discord?: {

        /**
         * Options for using this transport with a Discord bot.
         * 
         * *See: [Creating a Bot](https://v12.discordjs.guide/)*
         */
        bot?: {

            /**
             * Discord channel ID in which to send log entries.
             * 
             * To acquire:
             * 1. Open the Discord app.
             * 2. Click the settings cog icon in the bottom-left corner.
             * 3. Click "Advanced" in the "App Settings" category.
             * 4. Ensure that "Developer Mode" is enabled.
             * 5. Navigate to the Discord server in which the bot is a member.
             * 6. Right-click the text channel to which the log entries should be sent,
             *    and click "Copy ID" at the bottom of the context menu.
             */
            channel?: string;

            /**
             * Discord bot token authorized to send messages. The bot **must**
             * be invited to the Discord server in which the logging channel
             * exists.
             * 
             * *See: [Bot vs. User Account Tokens](https://discord.com/developers/docs/topics/oauth2#bot-vs-user-accounts)*
             */
            token?: string;
        };

        /**
         * Options for using this transport with a Discord webhook. This is the
         * recommended approach for simplicity.
         * 
         * To acquire:
         * 1. Open the Discord app.
         * 2. Navigate to the Discord server in to place log entries.
         * 3. Open the server settings, and click "Integrations".
         * 4. Click "New Webhook".
         * 5. Provide a unique
         */
        webhook?: {

            /**
             * Discord webhook URL at which to emit log entries.
             * 
             * To acquire:
             * 1. Open the Discord app.
             * 2. Navigate to the Discord server in which to place log entries.
             * 3. Open the server's settings, and click "Integrations".
             * 4. Click "New Webhook".
             * 5. Provide a name (e.g., "My Logging") and select the channel in
             *    which log entries should be placed.
             * 6. Click "Copy Webhook URL".
             */
            url?: string;
        };
    };

    /**
     * Whether to flush any unsent log entries prior to application exit.
     */
    //flushOnExit: boolean;

    /**
     * Log level colors.
     */
    colors?: DiscordTransportColorOptions;

    /**
     * Metadata to include in every Discord log entry.
     */
    metadata?: DiscordLogMetadata;
}

/**
 * Defines a type of global- or log-level metadata.
 */
type DiscordLogMetadata = {[key: string]: string};

/**
 * Internal utilities used by the transport.
 */
const utils = {

    /**
     * Default Discord embed color palette.
     */
    colors: {
        debug: 2196944,
        error: 14362664,
        info: 2196944,
        silly: 2210373,
        verbose: 6559689,
        warn: 16497928
    },

    /**
     * Creates a formatted message embed from a log entry and optional metadata.
     * 
     * @param {any} info 
     * @param {any} meta 
     * @param {DiscordTransportColorOptions} colors 
     * @returns {MessageEmbed}
     */
    createEmbed: function(
        info: any,
        meta: any = {},
        colors: DiscordTransportColorOptions = {} ): MessageEmbed {

        info = utils.populateError( info );

        const { level, message, meta: infoMeta } = info;
        const fields = utils.getEmbedFields( level, meta, infoMeta );
        colors = { ...utils.colors, ...colors };

        let title = message,
            description = utils.formatError( info );

        // Strip the error message out of the title.
        if ( description ) {
            const match = /Error: (.+)\n/gm.exec( description );
            if ( match && match.length > 1 )
                title = title.replace( match[ 1 ], '' ).trim();
        }

        let embed = new MessageEmbed()
            .setColor(( colors as any )[ level ])
            .setTitle( title )
            .addFields( fields );

        if ( level === 'error' && description )
            embed.setDescription( `\`\`\`\n${description}\n\`\`\`` );

        return embed;
    },

    /**
     * Fetches a formatted error string if applicable. Prefers stack, but
     * will use `toString` if no stack present.
     * 
     * @param {any} info 
     * @returns {string | undefined}
     */
    formatError: function( info: any ): string | undefined {
        let result: string | undefined;

        if ( info.error )
            result = info.error.stack || info.error.toString();

        return result;
    },

    /**
     * Fetches a collection of formatted and sorted embed fields.
     * 
     * @param {string} level 
     * @param {any} meta 
     * @param {any} entryMeta 
     * @returns {EmbedField[]}
     */
    getEmbedFields: function(
        level: string,
        globalMeta: DiscordLogMetadata = {},
        entryMeta: DiscordLogMetadata = {} ): EmbedField[] {
        
        const timestamp = new Date();

        let keyValues: {[key: string]: any} = {
            level,
            host: os.hostname(),
            timestamp: `${timestamp.toISOString()} (<t:${( timestamp.getTime() / 1000 ).toFixed()}:R>)`
        };
    
        Object.keys( globalMeta ).forEach( k =>
            keyValues[ k ] = globalMeta[ k ]);
    
        Object.keys( entryMeta ).forEach( k =>
            keyValues[ k ] = entryMeta[ k ]);
    
        const names: string[] = [];
        const values: any[] = [];
    
        Object
            .keys( keyValues )
            .sort()
            .forEach( k => {
                names.push( utils.ucFirst( k ));
                values.push( keyValues[ k ]);
            });
    
        return [
            { name: 'Metadata', value: names.join( '\n' ), inline: true },
            { name: `\u200b`, value: values.join( '\n' ), inline: true }
        ];
    },

    /**
     * Ensures that errors attached to a log entry are bubbled to the top.
     * 
     * @param {any} info 
     * @returns {any}
     */
    populateError: function( info: any ): any {
        if ( info.error )
            return info;

        const splat = info[ tripleBeam.SPLAT ] || [];
        info.error = splat.find(( o: any ) => o instanceof Error );

        return info;
    },

    /**
     * Capitalizes the first character in a string.
     * 
     * @param {string} value 
     * @returns {string}
     */
    ucFirst: function( value: string ): string {
        return value.charAt( 0 ).toUpperCase() +
            value.slice( 1 );
    }
};

/**
 * Discord transport handler using bots.
 */
 export class BotHandler implements DiscordTransportHandler {

    /**
     * This handler's type.
     */
    readonly type = 'bot';

    /**
     * RESTful Discord API client.
     */
    private readonly client: REST;

    /**
     * Discord channel ID.
     */
    private readonly channel: string;

    /**
     * Custom colors.
     */
    private readonly colors: DiscordTransportColorOptions | undefined;

    /**
     * Prepares a Discord bot-based transport handler.
     * 
     * @param {string} token 
     * @param {string} channel 
     * @param {DiscordTransportColorOptions} colors 
     */
    constructor(
        token: string,
        channel: string,
        colors?: DiscordTransportColorOptions ) {

        this.client = new REST({ version: '10' }).setToken( token );
        this.channel = channel;
        this.colors = colors;
    }

    /**
     * Logs an event using bots.
     * 
     * @param {any} info 
     * @param {any} meta 
     * @param {function} next 
     */
    async log( info: any, meta: any = {}, next: () => void ) {
        const embed = utils.createEmbed( info, meta, this.colors );

        try {
            await this.client.post( Routes.channelMessages( this.channel ),
                { body: { embeds: [ embed ]}});
        } catch ( err ) {
            console.error( 'Failed sending to Discord.', err );
        }
        
        next();
    }
}

/**
 * Discord transport handler using webhooks.
 */
export class WebhookHandler implements DiscordTransportHandler {

    /**
     * This handler's type.
     */
    readonly type = 'webhook';

    /**
     * Discord webhook client.
     */
    private client: WebhookClient;

    /**
     * Custom colors.
     */
    private readonly colors: DiscordTransportColorOptions | undefined;

    /**
     * Prepares a Discord webhook-based transport handler.
     * 
     * @param {string} url 
     * @param {DiscordTransportColorOptions} colors 
     */
    constructor( url: string, colors?: DiscordTransportColorOptions ) {
        this.client = new WebhookClient({ url });
        this.colors = colors;        
    }

    /**
     * Logs an event using webhooks.
     * 
     * @param {any} info 
     * @param {any} meta 
     * @param {function} next 
     */
    async log( info: any, meta: any = {}, next: () => void ) {
        const embed = utils.createEmbed( info, meta, this.colors );

        await this.client.send({
            embeds: [ embed ]
        });

        next();
    }
}

/**
 * Winston transport providing bot- or webhook-based logging to Discord.
 */
export class DiscordTransport extends TransportStream {

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

            if ( webhookUrl )
                handler = new WebhookHandler( webhookUrl, options?.colors );

            // Bot
            if ( !handler ) {

                const botChannel =
                    options?.discord?.bot?.channel ||
                    process.env.DISCORD_LOGGING_BOT_CHANNEL;
                
                const botToken =
                    options?.discord?.bot?.token ||
                    process.env.DISCORD_LOGGING_BOT_TOKEN;

                if ( botChannel && botToken )
                    handler = new BotHandler( botToken, botChannel, options?.colors );
            }

            if ( !handler )
                throw new Error( 'No webhook or bot configurations found in transport options or environment variables.' );
        } catch ( err ) {
            console.error( 'Failed determining Discord transport handler.', err );
        }

        return handler;
    }
}