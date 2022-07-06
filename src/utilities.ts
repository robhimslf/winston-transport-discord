import { EmbedField, MessageEmbed } from 'discord.js';
import stringifySafe from 'json-stringify-safe';
import tripleBeam from 'triple-beam';
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
    info = populateError( info );

    const { level, message, meta: infoMeta } = info;
    const fields = getEmbedFields( level, meta, infoMeta );

    let title = message,
        description = formatError( info );

    // Strip the error message out of the title.
    if ( description ) {
        const match = /Error: (.+)\n/gm.exec( description );
        if ( match && match.length > 1 )
            title = title.replace( match[ 1 ], '' ).trim();
    }

    let embed = new MessageEmbed()
        .setColor( Colors[ level ])
        .setTitle( title )
        .addFields( fields );

    if ( level === 'error' && description )
        embed.setDescription( `\`\`\`\n${description}\n\`\`\`` );

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

/**
 * Fetches a collection of formatted and sorted embed fields.
 * 
 * @param {string} level 
 * @param {any} meta 
 * @param {any} entryMeta 
 * @returns {EmbedField[]}
 */
function getEmbedFields( level: string, meta: any = {}, entryMeta: any = {} ): EmbedField[] {
    const timestamp = new Date();

    let keyValues: {[key: string]: any} = {
        level,
        host: os.hostname(),
        timestamp: `${timestamp.toISOString()} (<t:${( timestamp.getTime() / 1000 ).toFixed()}:R>)`
    };

    Object.keys( meta ).forEach( k =>
        keyValues[ k ] = meta[ k ]);

    Object.keys( entryMeta ).forEach( k =>
        keyValues[ k ] = entryMeta[ k ]);

    const names: string[] = [];
    const values: any[] = [];

    Object
        .keys( keyValues )
        .sort()
        .forEach( k => {
            names.push( ucFirst( k ));
            values.push( keyValues[ k ]);
        });

    return [
        { name: 'Metadata', value: names.join( '\n' ), inline: true },
        { name: `\u200b`, value: values.join( '\n' ), inline: true }
    ];
}

/**
 * Fetches a formatted error string if applicable. Prefers stack, but
 * will use `toString` if no stack present.
 * 
 * @param {any} info 
 * @returns {string | undefined}
 */
function formatError( info: any ): string | undefined {
    let result: string | undefined;

    if ( info.error )
        result = info.error.stack || info.error.toString();

    return result;
}

/**
 * Ensures that errors attached to a log entry are bubbled to the top.
 * 
 * @param {any} info 
 * @returns {any}
 */
function populateError( info: any ): any {
    if ( info.error )
        return info;

    const splat = info[ tripleBeam.SPLAT ] || [];
    info.error = splat.find(( o: any ) => o instanceof Error );

    return info;
}

/**
 * Capitalizes the first character in a string.
 * 
 * @param {string} value 
 * @returns {string}
 */
function ucFirst( value: string ): string {
    return value.charAt( 0 ).toUpperCase() +
        value.slice( 1 );
}