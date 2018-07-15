const $ = require('superagent')
const {userAgents} = require('./const')


/**
 * 
 * 根据的我猜测, 约座系统整体流程
 * 1: 进入站点获取 PHPSESSID
 * 2: login 用PHPSESSID后端php存贮状态这步将会设置你的信息和PHPSESSID关联
 * 3: 获取楼层roomID并且使用它
 * 4: 进入楼层获取座位信息
 * 5: 根据返回的座位信息和座位状态约座位
 * 
 * @method getPHPSESSID 获取PHPSESSID
 * @method login        设置登陆态
 * @method selectClass  设置roomID 这个不变 1 2 3 4
 * 
 * @method getRoomInfo  获取四个不同教室楼的信息[
 *  total":4,"thisPageRoom":4,"rows":[{"id":"1","name":"\u793e\u79d1\u501f\u9605\u5ba4","floor":"3","seating":"574","open_status":"1","remark":"","bespeak_status":"1","sort":"1"}]
 * ]
 * @param {bespeak_status} 教室楼开放情况 1 是未开放 0 是开放
 * 
 * @method checkSeatNum 获取room的状态信息
 * @param {allNoTotalNum allNoNum usedNum} 所有座位数量 所有座位数量 可以使用的数量
 * 
 * 
 * @method getSetInfo   获取room内的座位信息
 * @param {total thisPageSeat, rows} 所有座位数量 当前页面座位数量 单独座位信息 [
 *  {id: id}, {room_id; 房间id }, {seat_sn: 选取座位时候使用, bespeak[0 - 6] 座位时间段使用情况 座位状态 1 部可使用 0 可以使用}
 *  {use_status: 座位状态 1 部可使用 0 可以使用}
 *  {"id":"1","room_id":"1","seat_sn":"001",
 *  "window":"1","power":"0","use_status":"1",
 *  "temporary_leave":"0","is_retain":"0","remark":"",
 *  "sort":"1","bespeak0":"0","bespeak1":"0","bespeak2":"0",
 *  "bespeak3":"0","bespeak4":"0","bespeak5":"0","bespeak6":"0"}
 * ]
 * 
 * @method selectSeat   选择座位
 * 
 * 
 * @method checkSeat    查看选择座位后的情况
 * @method SignOutSeat  退出座位选择
 * 
 */


function getPHPSESSID () {
  return new Promise((resolve, reject) => {
    $.get('http://202.113.82.7/bespeak/index.php')
      .set('Host', '202.113.82.7')
      .set('Cache-Control', 'max-age=0')
      .set('Referer', 'http://202.113.82.7/')
      .set('Connection', 'keep-alive')
      .set(`Upgrade-Insecure-Requests`, 1)
      .set('Accept-Encoding', 'gzip, deflate')
      .set(`Accept`, 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')
      .set('Accept-Language', 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2')
      .set("User-Agent", userAgents[Math.floor((Math.random() * 15))])
      .end((err, res) => {
        PHPSESSID = res.header['set-cookie'][0].split(';')[0]
        if (err) return reject(err)
        resolve(PHPSESSID)
      })
  })
}


function login ({username = '', passwd = '', PHPSESSID = ''}) {
  return new Promise((resolve , reject) => {
    if (!username || !passwd || !PHPSESSID) return reject()
    $.post('http://202.113.82.7/api/bespeak/login_check_api.php')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Cookie', `${PHPSESSID}`)
      .send({username, passwd})
      .then((res) => {
        resolve(res.text)
      }).catch((e) => reject(e))
  })
}


function checkSeatNum({PHPSESSID = ''}) {
  return new Promise((resolve, reject) => {
    if (!PHPSESSID) return reject()
    $.post('http://202.113.82.7/api/bespeak/count_bespeak_seat_num_api.php')
      .set('Host', '202.113.82.7')
      .set('Origin', 'http://202.113.82.7')
      .set('Cache-Control', 'no-cache')
      .set('Connection', 'Keep-Alive')
      .set('Referer', 'http://202.113.82.7/bespeak/frame_room.php')
      .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      .set('Accept-Language', 'zh-CN')
      .set('Cookie', `${PHPSESSID}`)
      .set('Accept', '*/*')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('X-Requested-With', 'XMLHttpRequest')
      .set("User-Agent", userAgents[Math.floor((Math.random() * 15))])
      .end((e, res) => {
        if (e) return reject(e)
        resolve(res.text)
      })
  })
}

function getRoomInfo({PHPSESSID = ''}) {
  return new Promise((resolve, reject) => {
    if (!PHPSESSID) return reject()
    $.post('http://202.113.82.7/api/bespeak/bespeak_room_info_api.php')
      .set('Host', '202.113.82.7')
      .set('Origin', 'http://202.113.82.7')
      .set('Cache-Control', 'no-cache')
      .set('Connection', 'Keep-Alive')
      .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      .set('Accept-Language', 'zh-CN')
      .set('Content-Length', 14)
      .set('Cookie', `${PHPSESSID}`)
      .set('Accept', '*/*')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('X-Requested-With', 'XMLHttpRequest')
      .set("User-Agent", userAgents[Math.floor((Math.random() * 15))])
      .send({page: 1, rows: 10})
      .end((e, res) => {
        if (e) return reject(e)
        resolve(res.text)
      })
  })
}

function getSetInfo ({page = 1, rows = 700, whereData = '', PHPSESSID = ''}) {
  return new Promise((resolve, reject) => {
    if (!PHPSESSID) return reject()
    $.post('http://202.113.82.7/api/bespeak/bespeak_seat_info_api.php')
      .set('Host', '202.113.82.7')
      .set('Origin', 'http://202.113.82.7')
      .set('Cache-Control', 'no-cache')
      .set('Connection', 'Keep-Alive')
      .set('Referer', 'http://202.113.82.7/bespeak/frame_body.php')
      .set('Content-Length', 26)
      .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      .set('Accept-Language', 'zh-CN')
      .set('Cookie', `${PHPSESSID}`)
      .set('Accept', '*/*')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('X-Requested-With', 'XMLHttpRequest')
      .set("User-Agent", userAgents[Math.floor((Math.random() * 15))])
      .send({page, rows, whereData})
      .end((e, res) => {
        if (e) return reject(e)
        resolve(res.text)
      })
  })
}

function selectClass ({roomId = '', PHPSESSID = ''}) {
  return new Promise((resolve, reject) => {
    if (!PHPSESSID || roomId === '') return reject()
    $.post('http://202.113.82.7/api/bespeak/set_now_room_api.php')
      .set('Host', '202.113.82.7')
      .set('Origin', 'http://202.113.82.7')
      .set('Cache-Control', 'no-cache')
      .set('Referer', 'http://202.113.82.7/bespeak/frame_room.php')
      .set('Connection', 'Keep-Alive')
      .set('Content-Length', 8)
      .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      .set('Accept-Language', 'zh-CN')
      .set('Cookie', `${PHPSESSID}`)
      .set('Accept', '*/*')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('X-Requested-With', 'XMLHttpRequest')
      .set("User-Agent", userAgents[Math.floor((Math.random() * 15))])
      .send({roomId})
      .end((e, res) => {
        if (e) return reject(e)
        resolve(res.text)
      })
  })
}


function selectSeat ({seatNum = '', PHPSESSID = ''}) {
  return new Promise((reselve, reject) => {
    if (seatNum === '' || !PHPSESSID) return reject()
    $.post('http://202.113.82.7/api/bespeak/get_bespeak_seat_api.php')
      .send({seatNum})
      .set('Accept', '*/*')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Accept-Language', 'zh-CN')
      .set('Cache-Control', 'no-cache')
      .set('Connection', 'Keep-Alive')
      .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      .set('Cookie', `${PHPSESSID}`)
      .set('Host', '202.113.82.7')
      .set('Origin', 'http://202.113.82.7')
      .set('Referer', 'http://202.113.82.7/bespeak/win/now_select_seat_win.php')
      .set('X-Requested-With', 'XMLHttpRequest')
      .end((e, res) => {
        if (e) return reject(e)
        console.log(res.text)
        reselve(res.text)
      })
  })
}

function checkSeat ({PHPSESSID = ''}) {
  return new Promise((reselve, reject) => {
    if (!PHPSESSID) return reject()
    $.post('http://202.113.82.7/api/bespeak/check_bespeak_seat_api.php')
      .set('Accept', '*/*')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Accept-Language', 'zh-CN')
      .set('Cache-Control', 'no-cache')
      .set('Connection', 'Keep-Alive')
      .set('Cookie', `${PHPSESSID}`)
      .set('Host', '202.113.82.7')
      .set('Origin', 'http://202.113.82.7')
      .set('Referer', 'http://202.113.82.7/bespeak/frame_body.php')
      .set("User-Agent", userAgents[Math.floor((Math.random() * 15))])
      .set('X-Requested-With', 'XMLHttpRequest')
      .end((e, res) => {
        if (e) return reject(e)
        reselve(res.text)
      })
  })
}

function SignOutSeat ({PHPSESSID = ''}) {
  return new Promise((reselve, reject) => {
    if (!PHPSESSID) return reject()
    $.post('http://202.113.82.7/api/bespeak/cancel_bespeak_api.php')
      .set('Accept', '*/*')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Accept-Language', 'zh-CN')
      .set('Cache-Control', 'no-cache')
      .set('Connection', 'Keep-Alive')
      .set('Cookie', `${PHPSESSID}`)
      .set('Host', '202.113.82.7')
      .set('Origin', 'http://202.113.82.7')
      .set('Referer', 'http://202.113.82.7/bespeak/frame_body.php')
      .set("User-Agent", userAgents[Math.floor((Math.random() * 15))])
      .set('X-Requested-With', 'XMLHttpRequest')
      .end((e, res) => {
        if (e) return reject(e)
        reselve(res.text)
      })
  })
}


module.exports = {
  getPHPSESSID,
  login,
  selectClass,
  selectSeat,
  checkSeatNum,
  getSetInfo,
  getRoomInfo,
  checkSeat,
  SignOutSeat,
  SignOutSeat
}