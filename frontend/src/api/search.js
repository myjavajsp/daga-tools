/**
 * daga-clone — frontend/src/api/search.js
 * 影片搜索 API（爱奇艺上游，后端带缓存与降级）
 */

import client from './client';

/**
 * 搜索影片
 * @param {string} q    关键词
 * @param {number} page 页码（默认 1）
 * @returns {Promise<{success:boolean, data?:{
 *   list: Array<{id:string,name:string,year:string,score:number|null,cover:string,page_url:string,desc:string}>,
 *   total:number, page:number, page_size:number, pages:number,
 *   degraded?:boolean, message?:string
 * }>, error?:string}>}
 */
export async function searchVideos(q, page = 1) {
  const res = await client.get('/search', { params: { q, page } });
  return res.data;
}
