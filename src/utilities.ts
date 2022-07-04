import { EmbedField, MessageEmbed } from 'discord.js';
import stringifySafe from 'json-stringify-safe';
import os from 'os';

/**
 * Discord embed color palette.
 */
export const Colors: {[key: string]: number} = {
    debug: 2196944,
    error: 14362664,
    info: 2196944,
    silly: 2210373,
    verbose: 6559689,
    warn: 16497928
};

/**
 * Creates a formatted message embed from a log entry and optional metadata.
 * 
 * @param {any} info 
 * @param {any} meta 
 * @returns {MessageEmbed}
 */
export function createEmbed( info: any, meta: any = {} ): MessageEmbed {
    const { error, level, message, meta: infoMeta } = info;
    const title = message;
    const timestamp = new Date();
    const fields: EmbedField[] = [
        { name: 'timestamp', value: `${timestamp.toISOString()} (<t:${( timestamp.getTime() / 1000 ).toFixed()}:R>)`, inline: false },
        { name: 'level', value: level, inline: false },
        { name: 'host', value: os.hostname(), inline: false }
    ];

    Object.keys( meta ).forEach( k =>
        fields.push({ name: k, value: meta[ k ], inline: false }));

    if ( infoMeta !== undefined )
        Object.keys( infoMeta ).forEach( k =>
            fields.push({ name: k, value: infoMeta[ k ], inline: false }));

    let embed = new MessageEmbed()
        .setColor( Colors[ level ])
        .setTitle( title )
        .addFields( fields );

    if ( level === 'error' && error && error.stack )
        embed.setDescription( `\`\`\`${error.stack}\`\`\`` );

    return embed;
}

/**
 * Safely serializes a JSON object.
 * 
 * @param {any} json 
 * @returns {string}
 */
export function jsonStringify( json: any ): string {
    try {
        return JSON.stringify( json );
    } catch {
        return stringifySafe( json, null, null, () => {} );
    }
}