import type { TransportStreamOptions } from 'winston-transport';

/**
 * Interface contract of a transport handler.
 */
export interface DiscordTransportHandler {

    /**
     * Implementation of this handler's logging mechanism.
     * 
     * @param {any} info
     * @param {function} next
     */
    log: ( info: any, meta: any, next: () => void ) => void;
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
         * Options for using this transport with a Discord bot. This is the
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
             * URL of an avatar to associate with log entries.
             */
            avatarUrl?: string;

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
    flushOnExit: boolean;

    /**
     * Metadata to include in every Discord log entry.
     */
    metadata?: {[key: string]: string};
}