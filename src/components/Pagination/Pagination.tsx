import React from 'react'

export default function Pagination({totalData,itemsPerPage}:any) {
    let pages = []

    for (let i = 0; i < Math.ceil(totalData/itemsPerPage); i++) {
       pages.push(i)
        
    }
  return (
    <div>{
        pages.map((page,index) => {
return(
    <button key={index}>{page}</button>
)
        })
        }</div>
  )
}
