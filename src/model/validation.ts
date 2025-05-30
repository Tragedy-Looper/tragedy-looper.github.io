import Ajv from 'ajv';
import { betterAjvErrors, type ValidationError } from '@apideck/better-ajv-errors';
import scriptSchema from './../scripts.schema.json' with { type: 'json' };
import type { Script } from '../scripts.g';
import { isTragedySetName, tragedySets } from './tragedySets';


export function validateScript(obj: unknown): { valid: true, script: Script } | { valid: false, errors: ValidationError[] } {
    // const validation = validate(obj, scriptSchema.properties.scripts.items);

    if (typeof obj == 'string') {
        // we asume thats the script in json format in string representation
        try {
            obj = JSON.parse(obj);
        } catch (error) {
            return {
                valid: false,
                errors: [{
                    context: {
                        errorType: 'format',
                    },
                    message: `Invalid JSON format: ${error}`,
                    path: '{base}',
                }]
            };
        }
    }


    if (obj === null || typeof obj !== 'object') {
        return {
            valid: false,
            errors: [{
                context: {
                    errorType: 'type',
                },
                path: '{base}',
                message: 'must be object'
            }]
        };
    }
    if (!('tragedySet' in obj)) {
        return {
            valid: false,
            errors: [{
                context: {
                    errorType: 'required',
                }, path: '/tragedySet',
                message: 'must have required property "tragedySet"'
            }]
        };
    }
    const usedTragedySet = obj.tragedySet;
    if (typeof usedTragedySet !== 'string' || !isTragedySetName(usedTragedySet)) {
        return {
            valid: false,
            errors: [{
                context: {
                    errorType: 'enum',
                    allowedValues: Object.keys(tragedySets),
                },
                path: '/tragedySet',
                message: `must be one of the enum values: ${Object.keys(tragedySets).join(', ')}`
            }]
        };
    }

    const schema = scriptSchema.properties.scripts.items.oneOf.filter(x => x.properties.tragedySet.enum.includes(usedTragedySet))[0];
    if (!schema) {
        return {
            valid: false,
            errors: [{
                context: {
                    errorType: 'enum',
                    allowedValues: Object.keys(tragedySets),
                },
                message: `No schema found for tragedySet "${usedTragedySet}"`,
                path: '/tragedySet'
            }]
        };
    }

    // store possible additonal propertsys that are not in the schema, but may be in the object
    // wich is ok
    const additionalProps = ['id', 'local'];
    const data = Object.entries(obj).filter(([key]) => additionalProps.includes(key));
    // remove the additional properties from the object
    for (const [key] of data) {
        delete (obj as Record<string, unknown>)[key];
    }


    const ajv = new Ajv({ allErrors: true, strict: true });
    const validate = ajv.compile(schema);
    const valid = validate(obj);
    if (valid) {
        return {
            valid: true,
            script: { ...Object.fromEntries(data), ...obj } as Script,
        } as const;
    } else {
        const errors = betterAjvErrors({ schema: schema as unknown as any, data, errors: validate.errors });

        return {
            valid: false,
            errors
        } as const;
    }

}