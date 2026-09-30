import DB from '../../../server/config/db.js';

class UserCountModel {
	async usercount(date) {
		try {
			const newQuery = `
				select  
					spl.is_recurring,
					spl.payment_method AS payment_source, 
					count(DISTINCT user_id) AS count
				FROM  user_subscription_payment_log as spl
				WHERE 
					is_subscribed=1
					and payment_status = 'SUCCEEDED_PAYMENT'
					and convert_tz(spl.created_at, '+00:00', '+06:00') 
					and from_banglalink = 0
					and amount !='1'
					and rent_payment = 0
				GROUP BY  
					spl.payment_method, 
					spl.is_recurring;
			`;
			let newResult = await DB.query(newQuery)
			let getData=(item)=>{
				if(item?.payment_source?.toLowerCase()==="bkash")
					return {...item,
								image:"https://kabbik-space.sgp1.digitaloceanspaces.com/1713779372202.png",
								name: "Bkash",
						}
				if(item?.payment_source?.toLowerCase()==="nagad")
					return {...item, name:"Nagad",
								image:"https://kabbik-space.sgp1.digitaloceanspaces.com/1713779396431.png",
							}
				if(item?.payment_source?.toLowerCase()==="aamarpay")
					return {...item,image:"https://kabbik-ab-bucket.s3.ap-south-1.amazonaws.com/1685361594336.png",name:"Aamarpay Payment"}
				if(item?.payment_source?.toLowerCase()==="robi")
					return {...item,image:"https://kabbik-space.sgp1.digitaloceanspaces.com/1713779411161.png",name:item.is_recurring?"Robi":"Robi"}
				if(item?.payment_source?.toLowerCase()==="bl")
					return {...item,image:"/images/BLlogopng.png",name:item.is_recurring?"BL":"BL"}
				// if(item?.payment_source?.toLowerCase()==="ROBI")
				// 	return {...item,image:"https://kabbik-space.sgp1.digitaloceanspaces.com/1713779411161.png",name:"Robi Payment"}
				if(item?.payment_source?.toLowerCase()==="gp")
					return {...item,image:"https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/grameen%20.png",name:item.is_recurring?"GP": "GP"}
				if(item?.payment_source?.toLowerCase()==="app_store")
					return {...item,image:"https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/applepay.png",
						name:item.is_recurring?"Apple Pay":"Apple Pay"		
					}
				if(item?.payment_source?.toLowerCase()==="play_store")
					return {...item,image:"https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/googlepay.png",
						name:item.is_recurring?"Google Pay":"Google Pay"
					}
				if(item?.payment_source?.toLowerCase()==="stripe")
					return {...item,image:"https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/strip.png",
						name:item.is_recurring?"Stripe":"Stripe"
					}
				if(item?.payment_source?.toLowerCase()==="upay")
					return {...item,image:"/image.png",
						name:item.is_recurring?"Upay":"Upay"
				}
			}
			let newData=newResult.map((item)=>getData(item))
			newData=newData.filter((item)=>item!== undefined)
			return newData;
		} catch (error) {
			console.error('Error in usercount:', error);
			throw error;
		}
	}
	async blUserCount(date) {
		try {
			const newQuery=` 
					WITH latest_docs AS (
						SELECT *
						FROM (
							SELECT *,
								ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
							FROM user_subscription_payment_log where from_banglalink = 1
						) t
						WHERE rn = 1
					)					
											
						select 
					spl.is_recurring,
					spl.payment_method AS payment_source, 
					SUM(CASE WHEN spl.is_subscribed = 1  THEN 1 ELSE 0 END) AS count
					from latest_docs as spl
					WHERE 
					payment_status = 'SUCCEEDED_PAYMENT'
					and convert_tz(spl.created_at, '+00:00', '+06:00') 
					and from_banglalink = 1
					and amount !='1'
					and rent_payment = 0
					GROUP BY  
					spl.payment_method, 
					spl.is_recurring
			;`
			let newResult = await DB.query(newQuery)
			console.log(newResult)
			let getData=(item)=>{
				if(item?.payment_source?.toLowerCase()==="bkash")
					return {...item,
								image:"https://kabbik-space.sgp1.digitaloceanspaces.com/1713779372202.png",
								name: "Bkash",
						}
				if(item?.payment_source?.toLowerCase()==="nagad")
					return {...item, name:"Nagad",
								image:"https://kabbik-space.sgp1.digitaloceanspaces.com/1713779396431.png",
							}
				if(item?.payment_source?.toLowerCase()==="aamarpay")
					return {...item,image:"https://kabbik-ab-bucket.s3.ap-south-1.amazonaws.com/1685361594336.png",name:"Aamarpay Payment"}
				if(item?.payment_source?.toLowerCase()==="robi")
					return {...item,image:"https://kabbik-space.sgp1.digitaloceanspaces.com/1713779411161.png",name:item.is_recurring?"Robi":"Robi"}
				if(item?.payment_source?.toLowerCase()==="bl")
					return {...item,image:"/images/BLlogopng.png",name:item.is_recurring?"BL":"BL"}
				// if(item?.payment_source?.toLowerCase()==="ROBI")
				// 	return {...item,image:"https://kabbik-space.sgp1.digitaloceanspaces.com/1713779411161.png",name:"Robi Payment"}
				if(item?.payment_source?.toLowerCase()==="gp")
					return {...item,image:"https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/grameen%20.png",name:item.is_recurring?"GP": "GP"}
				if(item?.payment_source?.toLowerCase()==="app_store")
					return {...item,image:"https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/applepay.png",
						name:item.is_recurring?"Apple Pay":"Apple Pay"		
					}
				if(item?.payment_source?.toLowerCase()==="play_store")
					return {...item,image:"https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/googlepay.png",
						name:item.is_recurring?"Google Pay":"Google Pay"
					}
				if(item?.payment_source?.toLowerCase()==="stripe")
					return {...item,image:"https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/strip.png",
						name:item.is_recurring?"Stripe":"Stripe"
				}
				if(item?.payment_source?.toLowerCase()==="upay")
					return {...item,image:"/image.png",
						name:item.is_recurring?"Upay":"Upay"
				}
			}
			let newData=newResult.map((item)=>getData(item))
			newData=newData.filter((item)=>item!== undefined)
			return newData;
		} catch (error) {
			console.error('Error in usercount:', error);
			throw error;
		}
	}
}

export default new UserCountModel();
