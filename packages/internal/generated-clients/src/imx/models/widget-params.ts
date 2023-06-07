/* tslint:disable */
/* eslint-disable */
/**
 * Immutable X API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 3.0
 * Contact: support@immutable.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */



/**
 * 
 * @export
 * @interface WidgetParams
 */
export interface WidgetParams {
    /**
     * Amount that will be prefilled in the widget
     * @type {string}
     * @memberof WidgetParams
     */
    'amount'?: string;
    /**
     * Currencies that will be available in the widget. If not defined all available currencies will be shown
     * @type {Array<string>}
     * @memberof WidgetParams
     */
    'supported_currencies'?: Array<string>;
    /**
     * Widget theme dark by default
     * @type {string}
     * @memberof WidgetParams
     */
    'theme'?: string;
}

