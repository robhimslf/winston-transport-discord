import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { createEmbed } from '../utilities';
import type { DiscordTransportHandler } from '../types';

export class BotHandler implements DiscordTransportHandler {

    /**
     * RESTful Discord API client.
     */
    private readonly client: REST;

    /**
     * Discord channel ID.
     */
    private readonly channel: string;

    /**
     * Prepares a Discord bot-based transport handler.
     * 
     * @param {string} token 
     * @param {string} channel 
     */
    constructor( token: string, channel: string ) {
        this.client = new REST({ version: '10' }).setToken( token );
        this.channel = channel;
    }

    /**
     * Logs an event using bots.
     * 
     * @param {any} info 
     * @param {any} meta 
     * @param {function} next 
     */
    async log( info: any, meta: any = {}, next: () => void ) {
        const embed = createEmbed( info, meta );

        try {
            await this.client.post( Routes.channelMessages( this.channel ),
                { body: { embeds: [ embed ]}});
        } catch ( err ) {
            console.error( 'Failed sending to Discord.', err );
        }
        
        next();
    }
}