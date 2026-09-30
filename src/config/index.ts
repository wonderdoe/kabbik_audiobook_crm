import {
	IconAccessible,
	IconBlockquote,
	IconBrandOpenSource,
	IconComponents,
	IconDashboard,
	IconDiscount,
	IconGift,
	IconBolt,
	IconMicrophone,
	IconRecordMail,
	IconReport,
	IconTruckDelivery,
	IconUsers,
	IconWriting,
} from '@tabler/icons-react';
import { NavItem } from '@/types/nav-item';
import { checkgetPermission } from '@/helper/Commonfunction';

//dashboard;top_listners;assign_roles;see_crm_admins;add_crm_users;add_audio_books;update_audio_books;delete_audio_books;see_audio_books;see_hero_banners;add_hero_banners;update_hero_banners;delete_hero_banners;see_popup_banner;book_reveiw;book_request;see_featured_books;add_featured_books;update_featured_books;delete_featured_books;see_category;add_category;update_category;delete_category;see_upcoming_audio;add_upcoming_audio;update_upcoming_audio;delete_upcoming_audio;push_notification_audiobook_details;push_notification_subscription;push_notification_common;push_notification_list;email_notification;see_promocode;add_promocode;update_promocode;delete_promocode;daywise_promocode_activation;recording;see_publisher_list;add_publisher_list;update_publisher_list;delete_publisher_list;see_author_list;add_author_list;update_author_list;delete_author_list;see_subscription;manual_subscription_log;see_user_report;see_subscription_revenue_report;see_rent_revenue_report;see_payment_gateway_wise_report;see_package_wise_report;see_sign_up_report;see_play_count_report;see_voice_artist;see_product_orders;see_request_access;blogs
export const navLinks: NavItem[] = [
	{ permissions:"",
		label: 'Dashboard', icon: IconDashboard, link: '/dashboard' },

	{
		permissions:"",
		label: 'Users',
		icon: IconUsers,
		initiallyOpened: true,
		links: [
			{
				permissions:"assign_roles",
				label: 'Roles',
				link: '/dashboard/roles',
			},
			{
				permissions:"see_crm_admins",
				label: 'Add User',
				link: '/dashboard/add-user',
			},
		],
	},

	{
		permissions:"",
		label: 'Contents',
		icon: IconMicrophone,
		initiallyOpened: true,
		links: [
			{
				permissions:"see_audio_books",
				label: 'Audio books',
				link: '/dashboard/audiobook',
			},
			{
				permissions:"see_hero_banners",
				label: 'Hero Banner',
				link: '/dashboard/herobanner',
			},

			{
				permissions:"see_popup_banner",
				label: 'Popup Banner',
				link: '/dashboard/popupbanner',
			},
			{
				permissions:"see_popup_banner",
				label: 'Promotion Banner',
				link: '/dashboard/promotionbanner',
			},
			{
				permissions:"book_reveiw",
				label: 'Book Review',
				link: '/dashboard/bookreview',
			},

			{
				permissions:"book_request",
				label: 'Book Request',
				link: '/dashboard/bookrequest',
			},
			{
				permissions:"see_featured_books",
				label: 'Featured Book',
				link: '/dashboard/featured',
			},

			{
				permissions:"see_category",
				label: 'Category',
				link: '/dashboard/category',
			},
			{
				permissions:"see_upcoming_audio",
				label: 'Upcoming Audio',
				link: '/dashboard/upcoming-audio',
			},
			{
				permissions:"push_notification_audiobook_details",
				label: 'Push Notification',
				link: '/dashboard/push-notification',
			},
			{
				permissions:"email_notification",
				label: 'Email Notification',
				link: '/dashboard/email-notification',
			},
		],
	},

	{
		permissions:"",
		label: 'Promocode',
		icon: IconDiscount,
		initiallyOpened: true,
		links: [
			{
				permissions:"see_promocode",
				label: 'Promocode',
				link: '/dashboard/promocode',
			},
			{
				permissions:"daywise_promocode_activation",
				label: 'Daywise Promo Activation',
				link: '/dashboard/daywisepromo',
			},
		],
	},

	{
		permissions:"",
		label: 'Recording',
		icon: IconRecordMail,
		initiallyOpened: true,
		links: [
			{
				permissions:"recording",
				label: 'Recording',
				link: '/dashboard/recording',
			},
		],
	},
	{
		permissions:"",
		label: 'Publishers & Authors',
		icon: IconWriting,
		initiallyOpened: true,
		links: [
			{
				permissions:"see_publisher_list",
				label: 'Publishers List',
				link: '/dashboard/publishers',
			},

			{
				permissions:"see_author_list",
				label: 'Authors List',
				link: '/dashboard/authors',
			},
		],
	},
	{
		permissions: '',
		label: 'Rewards',
		icon: IconGift,
		link: '/dashboard/rewards',
	},
	{
		permissions: '',
		label: 'Quick Access',
		icon: IconBolt,
		link: '/dashboard/quick-access',
	},
	{
		permissions:"",
		label: 'Subscription',
		icon: IconAccessible,
		initiallyOpened: true,
		links: [
			{
				permissions:"see_subscription",
				label: 'Subscription',
				link: '/dashboard/subscription',
			},
			{
				permissions:"manual_subscription_log",
				label: 'Manual Subscription Log',
				link: '/dashboard/manual-subscription-log',
			},
		],
	},
	{
		permissions:"",
		label: 'Report',
		icon: IconReport,
		initiallyOpened: true,
		links: [
			{
				permissions:"see_user_report",
				label: 'User Report',
				link: '/dashboard/user-report',
			},
			{
				permissions:"see_subscription_revenue_report",
				label: 'Subscription Revenue Report',
				link: '/dashboard/revenue',
			},
			{
				permissions:"see_rent_revenue_report",
				label: 'Rent Revenue Report',
				link: '/dashboard/rent',
			},
			{
				permissions:"see_payment_gateway_wise_report",
				label: 'Payment Gateway Wise Report',
				link: '/dashboard/pgw-revenue',
			},
			{ permissions:"see_package_wise_report",
				label: 'Package Wise Report', link: '/dashboard/package-wise-report' },
			{
				permissions:"see_sign_up_report",
				label: 'Sign Up Report',
				link: '/dashboard/sign-up-report',
			},
			{
				permissions:"see_play_count_report",
				label: 'Play Count Report',
				link: '/dashboard/play-count-report',
			},
		],
	},
	{
		permissions:"",
		label: 'Components',
		icon: IconComponents,
		initiallyOpened: true,
		links: [
			{
				permissions:"see_voice_artist",
				label: 'Voice Artist',
				link: '/dashboard/voiceartist',
			},
		],
	},
	{
		permissions:"",
		label: 'Product Orders',
		icon: IconTruckDelivery,
		link: '/dashboard/product-orders',
	},
	{
		permissions:"",
		label: 'Publisher Portal',
		icon: IconBrandOpenSource,
		links: [
			{
				permissions:"see_request_access",
				label: 'Request Access',
				link: '/dashboard/publisher-requests',
			},
		],
	},
	{
		permissions:"",
		label: 'SponsorShip Request',
		icon: IconBlockquote,
		links: [
			{
				permissions:"blogs",
				label: 'List',
				link: '/dashboard/sponsorship-request',
			},
		],
	},
	{
		permissions:"",
		label: 'Blogs',
		icon: IconBlockquote,
		links: [
			{
				permissions:"blogs",
				label: 'List',
				link: '/dashboard/blogs',
			},
		],
	},
];


export const getNavLinks = () => {
	let newNavLinks = [...navLinks];

	return newNavLinks.filter(item => {
			if (item.links) {
				item.links = item.links.filter(link => {
					return checkgetPermission(link.permissions ) ;
				});
				return  item.links.length > 0;
			}
			return item.links? false:true;
		});

}
