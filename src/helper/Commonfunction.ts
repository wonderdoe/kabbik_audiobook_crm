import Cookies from "js-cookie";

const jwt = require('jsonwebtoken');



export function formatSeconds(seconds:number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hrs} h : ${mins.toString().padStart(2, '0')} m : ${secs.toString().padStart(2, '0')} s`;
}

export const getFirstDayofMonth=(date:Date|string)=>{
    let newDate=new Date(date??'')
    newDate.setDate(1)
    // console.log("newDate",newDate);
    
    return newDate;
}

export function calculatePercentage(value:number|string, percentage:number) {
  
  const numericValue = typeof value == 'string'? parseFloat(value):value;
  
  if (isNaN(numericValue) || isNaN(percentage)) {
   return 0;
  }
  console.log(value,(numericValue * percentage) / 100)
  return Math.round((numericValue * percentage) / 100);
}


/** Sum backend user-report rows (matches worker sumMappedCounts / dashboard extractReportSummary). */
export function sumUserReportMappedRows(data: unknown): number {
  if (!Array.isArray(data)) return 0;
  return data.reduce((acc, row) => acc + Number((row as { count?: number })?.count ?? 0), 0);
}

export const getUserReportFormat=(data:any)=>{
  if(data==null ) return [];
  const result:any = {
  };
  data.forEach((item:any) => {
    if(item==null ) return; // Skip if payment_source or count is not present
    const key = item.payment_source.toLowerCase();
    const displayName = item.name || key;
    if (!result[key]) {
      result[key] = {
        recurring: item.is_recurring ? item.count : 0,
        is_onetime: !item.is_recurring ? item.count : 0,
        image:item.image || '',
        count: item.count ?? 0,
        name: displayName,
        title: displayName,
      }
    }else{
        const currentItem = result[key];
        const nextCount = Number(item.count) + Number(currentItem.count);
        result[key].count = nextCount;
        if (item.is_recurring) {
          result[key].recurring += item.count;
        } else {
          result[key].is_onetime += item.count;
        }
      }
    // Add more payment sources as needed
  });

  return Object.keys(result).map((key) => ({
    ...result[key]
  })).sort((a:any, b:any) => {
    return b.count - a.count;
  });
}

export const createActivityLog = async (data:any) => {
  let token = Cookies.get('admin_token');
  const payload = jwt.decode(token);
  try {
    data.user_id = payload?.id;
    data.user_email = payload?.email;
    const deviceInfo = `UA=${navigator.userAgent},PF=${ navigator.platform},SW=${window.innerWidth},SH=${window.innerHeight},LAN=${ navigator.language}`;
    data.device_info = deviceInfo;
		const response = await fetch(`/api/routes/post-activity-log`, {
			method: 'POST',
			body: JSON.stringify({
        ...data,
      })
    });
  } catch (error) {
    return error;
  }
}

export const getPayloadFromJWT = () => {
  const token = Cookies.get('admin_token');
  return jwt.decode(token);
}

export const checkgetPermission=(accessName:string | undefined)=>{
  if(!accessName) return true;
  const payload = getPayloadFromJWT();
  if (!payload || !payload.userPermissions) {
    return false;
  }
  return payload.userPermissions.includes(accessName);
}

/** Nav/config: `a|b` means user needs any one permission slug. */
export const checkNavPermission = (accessName?: string) => {
  if (!accessName) return true;
  if (accessName.includes('|')) {
    return accessName
      .split('|')
      .map(s => s.trim())
      .filter(Boolean)
      .some(slug => checkgetPermission(slug));
  }
  return checkgetPermission(accessName);
};

export  function decodeWord(encodedStr:string) {
  return decodeURIComponent(encodedStr);
}



//dashboard;top_listners;assign_roles;see_crm_admins;add_crm_users;add_audio_books;update_audio_books;delete_audio_books;see_audio_books;see_hero_banners;add_hero_banners;update_hero_banners;delete_hero_banners;book_reveiw;book_request;see_featured_books;add_featured_books;update_featured_books;delete_featured_books;see_category;add_category;update_category;delete_category;see_upcoming_audio;add_upcoming_audio;update_upcoming_audio;delete_upcoming_audio;push_notification_audiobook_details;push_notification_subscription;push_notification_common;push_notification_list;email_notification;see_promocode;add_promocode;update_promocode;delete_promocode;daywise_promocode_activation;recording;see_publisher_list;add_publisher_list;update_publisher_list;delete_publisher_list;see_author_list;add_author_list;update_author_list;delete_author_list;see_subscription;manual_subscription_log;see_user_report;see_subscription_revenue_report;see_rent_revenue_report;see_payment_gateway_wise_report;see_package_wise_report;see_sign_up_report;see_play_count_report;see_voice_artist;see_product_orders;see_request_access;blogs