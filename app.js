const fetch = require('node-fetch');
const fs = require('fs');

const url_ig = "https://www.instagram.com/"

const config = JSON.parse(fs.readFileSync('app.json').toString())

let process_like_arr = []

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function getHome(){
  console.log(`${arguments.callee.name} = get feed`)
  fetch(url_ig, {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en,id-ID;q=0.9,id;q=0.8,en-US;q=0.7",
      "cache-control": "max-age=0",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "cookie": config.cookies
    },
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": null,
    "method": "GET",
    "mode": "cors"
  }).then(res=>res.text())
  .then(body=>{
    if(body.includes("('feed',")){
      const data = JSON.parse(body.match(/<script type="text\/javascript">window\.__additionalDataLoaded\('feed',(.*?)\);<\/script>/)[1])
      data["user"]["edge_web_feed_timeline"]["edges"].forEach(e => {
        const ee = e["node"]
        if(ee.viewer_has_liked === false){
          process_like_arr.push({
            id: ee.id,
            shortcode: ee.shortcode,
            from:{
              fullname: ee.owner.full_name,
              username: ee.owner.username
            }
          })
        }
      });
    }else{
      console.log(`cookie mati?`)
    }
  })
  .catch(e=>{
    console.log(`${arguments.callee.name} = ${e.message}`)
  })
}

function seeStory(){
  fetch("https://www.instagram.com/stories/reel/seen?hl=id", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-csrftoken": "TLw2xdRRtrDA1L0ec9QCJs9FUv8ILjZ3",
      "x-ig-app-id": "936619743392459",
      "x-ig-www-claim": "hmac.AR3vMVk0FZ-DlyQ2lPKqgFyeXyTGGLw8uA2PN-GPpA0EyhHW",
      "x-instagram-ajax": "98349da5360c",
      "x-requested-with": "XMLHttpRequest",
      "cookie": "ig_did=E107FCF9-B61A-4587-A2BE-C74E736D15FC; mid=X0OM4AALAAEWyIy9zZJs_0-TL9XK; fbm_124024574287414=base_domain=.instagram.com; csrftoken=TLw2xdRRtrDA1L0ec9QCJs9FUv8ILjZ3; ds_user_id=1552699077; sessionid=1552699077%3ATtj0lkFwBwJYHZ%3A15; shbid=894; shbts=1598262521.2791069; rur=ASH; urlgen=\"{\\\"110.138.151.66\\\": 7713}:1kAO3w:vCqgnk1SU_sbbneN9zMjnf1MLVw\""
    },
    "referrer": "https://www.instagram.com/",
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": "reelMediaId=2382567333706464378&reelMediaOwnerId=3104719430&reelId=3104719430&reelMediaTakenAt=1598244175&viewSeenAt=1598244175",
    "method": "POST",
    "mode": "cors"
  }).then(res=>res.text())
  .then(body=>{
    fs.writeFileSync('story.html',body)
  })
}

function postLike(){
  const id = process_like_arr[0].id
  fetch(`${url_ig}web/likes/${id}/like/?hl=id`, {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-csrftoken": config.csrftoken,
      "x-ig-app-id": config.igappid,
      "x-ig-www-claim": config.igwwwclaim,
      "x-instagram-ajax": config.instagramajax,
      "x-requested-with": "XMLHttpRequest",
      "cookie": config.cookies
    },
    "referrer": url_ig,
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": null,
    "method": "POST",
    "mode": "cors"
  }).then(res=>res.json())
  .then((res)=>{
    console.log(`${arguments.callee.name} ===================`)
    console.log(`${arguments.callee.name} = from post : ${process_like_arr[0].from.fullname}`)
    console.log(`${arguments.callee.name} = url post : https://www.instagram.com/p/${process_like_arr[0].shortcode}/`)
    if(res.status === "ok"){
      console.log(`${arguments.callee.name} = status : ${res.status}`)
    }else{
      console.log(`${arguments.callee.name} = status : gagal`)
    }
    process_like_arr.splice(0,1)
  })
  .catch(e=>{
    console.log(`${arguments.callee.name} = ${e.message}`)
  })
}


function main(){
  getHome()
  setInterval(()=>{
    if(process_like_arr.length > 0){
      postLike()
    }else{
      getHome()
    }
  },getRndInteger(3000,30000))
}

// main()
seeStory()
