import type { RouteLike } from '@discordjs/rest';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { MessageEmbed } from 'discord.js';

/**
 * Base Discord transport handler class.
 */
export class HandlerBase {

    /**
     * RESTful Discord API client.
     */
    private readonly client: REST;

    /**
     * Prepares a RESTful Discord API client.
     * 
     * *Only provide `token` if using as the base of a bot-based handler.*
     * 
     * @param {string} token 
     */
    constructor( token?: string ) {
        
        this.client = new REST({ version: '10' });
        if ( token )
            this.client.setToken( token );
    }

    /**
     * Sends a log entry via bot.
     * 
     * @param {string} channelId 
     * @param {MessageEmbed} content 
     */
    async send( channelId: string, content: MessageEmbed ): Promise<void>;

    /**
     * Sends a log entry via webhook.
     * 
     * @param {string} webhookId 
     * @param {string} webhookToken 
     * @param {MessageEmbed} content 
     */
    async send( webhookId: string, webhookToken: string, content: MessageEmbed ): Promise<void>;

    /**
     * Sends a log entry.
     * 
     * @param {string} channelOrWebhookId 
     * @param {string | MessageEmbed} webhookTokenOrContent 
     * @param {MessageEmbed} webhookContent 
     */
    async send(
        channelOrWebhookId: string,
        webhookTokenOrContent: string | MessageEmbed,
        webhookContent?: MessageEmbed ): Promise<void> {

        try {
            let route: RouteLike | undefined,
                embed: unknown = undefined;
            
            // Webhook
            if ( typeof webhookTokenOrContent === 'string' && webhookContent ) {
                route = Routes.webhook( channelOrWebhookId, webhookTokenOrContent );
                embed = webhookContent;
            }

            // Bot
            else if ( webhookTokenOrContent instanceof MessageEmbed ) {
                route = Routes.channelMessages( channelOrWebhookId );
                embed = webhookTokenOrContent;
            }

            if ( !route || embed === undefined )
                throw new TypeError( 'Route and body are required to send to Discord.' );

            await this.client.post( route, { body: { embeds: [ embed ]}});
        } catch ( err ) {
            console.error( 'Failed sending to Discord.', err );
        }
    }
}