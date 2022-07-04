import { WebhookClient } from 'discord.js';
import { createEmbed } from '../utilities';
import type { DiscordTransportHandler } from '../types';

/**
 * Discord transport handler using webhooks.
 */
export class WebhookHandler implements DiscordTransportHandler {

    /**
     * URL of an avatar to associate with log entries.
     */
    private readonly avatarUrl?: string;

    /**
     * Discord webhook client.
     */
    private client: WebhookClient;

    /**
     * Prepares a Discord webhook-based transport handler.
     * 
     * @param {string} url 
     */
    constructor( url: string, avatarUrl?: string ) {
        this.client = new WebhookClient({ url });
        this.avatarUrl = avatarUrl;
    }

    /**
     * Logs an event using webhooks.
     * 
     * @param {any} info 
     * @param {any} meta 
     * @param {function} next 
     */
    async log( info: any, meta: any = {}, next: () => void ) {
        const embed = createEmbed( info, meta );

        await this.client.send({
            avatarURL: this.avatarUrl,
            embeds: [ embed ]
        });

        next();
    }
}