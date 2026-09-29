export type Author = {
	id: number;
	name: string;
	en_name: string;
	description: string;
	isActive: 0 | 1;
	deleted: 0 | 1;
	imageUrl: string;
	created_at: Date;
	updated_at: Date;
};

export type Publisher = {
	id: number;
	full_name: string;
	en_name: string;
	imageUrl: string | null;
	address: string;
	email: string;
	pass_hash: string;
	phone: string;
	revenue_share: { [string]: number } | null;
	revenue_threshold: number | null;
	admin_id: null;
	role: 'admin' | null;
	deleted: number;
	created_at: Date;
	updated_at: Date;
};

export type Artist = {
	id: number;
	name: string;
	en_name: string | null;
	imageUrl: string | null;
	description: string;
	isActive: 0 | 1;
	deleted: 0 | 1;
	created_at: Date;
	updated_at: Date;
};

export type AudiobookCategory = {
	id: number;
	name: string;
	thumb_path: string;
	priority: number;
	forAcademic: number;
	deleted: number;
	created_at: Date;
	updated_at: Date;
};

export type Audiobook = {
	id: number;
	name: string;
	description: string;
	author_name: string;
	contributing_artists: string;
	price: string;
	discount_price: string;
	guid: number | null;
	publish_year: null;
	thumb_path: string;
	banner_path: string;
	premium: number;
	approval_status: number;
	play_count: number;
	for_app: number;
	deleted: number;
	created_at: Date;
	updated_at: Date;
	category_id: null;
	channel_id: number | null;
	podcast: number;
	en_name: string;
	en_author_name: string | null;
	en_contributing_artists: string | null;
	publisher_id: number;
	isFeatured: number;
	featured_image: string | null;
	mybl_play_count: number;
	for_home: number;
	for_rent: number;
};

export type Episode = {
	id: number;
	name: string;
	description: string | null;
	file_name: string | null;
	file_path: string;
	created_at: Date;
	updated_at: Date;
	audiobook_id: number;
	isfree: number | null;
	play_count: number | null;
	duration: number;
	bgm_filepath: string | null;
};

export type Blog = {
	id?: number;
	title: string;
	slug?: string;
	excerpt: string;
	categories: string;
	content_body: any;
	featured_image: string;
	alter_text_for_featured_image: string;
	author: string;
	user_id?: number;
	approved?: number;
	deleted?: number;
	meta_title?: string;
	meta_description?: string;
	meta_keywords?: string;
	meta_author?: string;
	publish_date?: string;
	created_at?: string;
	updated_at?: string;
};
