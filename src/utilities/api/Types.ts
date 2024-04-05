import { ReadStream } from 'node:fs';
import { Site as SquareOnlineSite, Error as SquareError } from 'square';

export type SECTION = 'section';
export type CONTAINER = 'container';
export type SiteGlobalElementType = SECTION | CONTAINER;

export interface RawResource {
    created_at: string; // timestamp RFC 3339
    updated_at: string; // timestamp RFC 3339
}

export interface Resource {
    createdAt: string; // timestamp RFC 3339
    updatedAt: string; // timestamp RFC 3339
}

export type BinaryEncodingTypeEnum = 'base64' | 'none' // todo - follow up on the second value

export interface RawSite {
    id: string;
    site_title?: string | null;
    domain?: string | null;
    is_published?: string | null;
    created_at: string;
    updated_at: string;
    site_theme_id?: string | null
}

export interface Site extends SquareOnlineSite {
    siteThemeId?: string | null;
}

export interface SiteSetting extends Resource {
    name: string;
    properties: string; // JSON string
}

export interface SiteGlobalElement extends Resource{
    name: string;
    type: SiteGlobalElementType;
    properties: string // JSON string
}

export interface RawSitePage extends RawResource {
    id: string;
    route: string;
    name: string;
    site_id: string;
    properties: string;// JSON string
}

export interface SitePage extends Resource {
    id: string;
    route: string;
    name: string;
    siteId: string;
    properties: string;// JSON string
}

export interface RawThemeFileMeta extends Omit<RawResource, 'created_at'> {
    path: string;
    site_theme_id: string;
    checksum: string; // sha256
    content_type: string; // the Mimetype if the file
    size: number; // file size in bytes
}

export interface RawThemeFile extends RawThemeFileMeta {
    binary_encoding_type: BinaryEncodingTypeEnum;
    content: string;
}

export interface ThemeFileMeta extends Omit<Resource, 'createdAt'> {
    path: string;
    siteThemeId: string;
    checksum: string; // sha256
    contentType: string; // the Mimetype if the file
    size: number; // file size in bytes
}

export interface ThemeFile extends ThemeFileMeta {
    binaryEncodingType: BinaryEncodingTypeEnum;
    content: string;
}

export interface Theme {
    id: string;
}

export type RawAPITypes = RawThemeFile
    | RawThemeFileMeta
    | RawResource
    | SiteGlobalElement
    | SitePage
    | SiteSetting;

export type APITypes = Theme
    | ThemeFile
    | ThemeFileMeta
    | SiteGlobalElement
    | SiteSetting
    | SitePage
    | Site;

export type CustomThemeResources = ThemeFile
    | ThemeFileMeta
    | SiteGlobalElement
    | SiteSetting
    | SitePage;

export type GlobalElementFilterQuery = {
    [key in SiteGlobalElementType]: string;
};

export interface ThemeFileFilterQuery {
    path: string;
}

export interface SettingFilterQuery {
    name: string;
}

export type DeleteQueryParams = undefined | SettingFilterQuery | ThemeFileFilterQuery | GlobalElementFilterQuery;
export interface PaginationQuery {
    limit: number;
    cursor?: string;
}
export type QueryParams = SettingFilterQuery
    | ThemeFileFilterQuery
    | GlobalElementFilterQuery
    | PaginationQuery
    | undefined;

export interface CreateSitePagePayload {
    page: Omit<Omit<SitePage, keyof Resource>, 'id' | 'siteId'>;
    idempotency_key: string;
}

export interface CreateThemePayload {
    idempotency_key: string;
}

export type UpsertSettingPayload = Omit<SiteSetting, keyof Resource>;
export type UpsertGlobalElementPayload = Omit<SiteGlobalElement, keyof Resource>;

export type UpdateSitePagePayload = CreateSitePagePayload;
export type BodyPayloads = CreateSitePagePayload
    | UpdateSitePagePayload
    | UpsertSettingPayload
    | UpsertGlobalElementPayload
    | CreateThemePayload
    | undefined;

export interface ApiResponse {
    errors: SquareError[]
}
export interface SitesAPIResponse extends ApiResponse {
    sites?: RawSite[]
}

export interface ThemeResponse extends ApiResponse {
    theme: Theme;
}

export interface ThemeFilesMetaResponse extends ApiResponse {
    files: RawThemeFileMeta[];
    cursor?: string;
}

export interface ThemeFilesResponse extends ApiResponse {
    files?: RawThemeFile[];
}

export interface ThemeFileResponse extends ApiResponse {
    file: RawThemeFile;
}

export interface PagesResponse extends ApiResponse {
    pages?: SitePage[];
    cursor?: string;
}

export interface PageResponse extends ApiResponse {
    page: SitePage;
}

export interface SettingsResponse extends ApiResponse {
    settings?: SiteSetting[]
}

export interface SettingResponse extends ApiResponse {
    setting: SiteSetting;
}

export interface GlobalElementsResponse extends ApiResponse {
    global_elements?: SiteGlobalElement [];
}

export interface GlobalElementResponse extends ApiResponse {
    global_element: SiteGlobalElement;
}

export interface IdentifierPart {
    path: string;
}

export interface ContentPart {
    content: InstanceType<typeof ReadStream>;
    contentType: string;
}

export type ThemeFileUpsertParts = [
    IdentifierPart,
    ContentPart,
];
