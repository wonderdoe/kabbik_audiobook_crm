import { decodeWord } from '@/helper/Commonfunction';
import { deleteScheduleUrl, scheduleListUrl } from '@/utils/constant';
import { Button, Loader, Table } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2';

const ScheduleList = () => {
    const [schedules,setSchedules]=useState([])
    const [isLoader,setIsLoader]=useState(false);
    const [nextTokens, setNextTokens] = useState<string[]>([]);
    const [page, setPage] = useState<number>(1);

    async function getSchedules(pageToLoad: number = 1) {
        try {
            setIsLoader(true)

            const tokenIndex = pageToLoad - 2;
            const pageNextToken =
                tokenIndex >= 0 && tokenIndex < nextTokens.length
                    ? nextTokens[tokenIndex]
                    : undefined;

            const bodyPayload: any = {};
            if (pageNextToken !== undefined) {
                bodyPayload.nextToken = pageNextToken;
            }

            const response = await fetch(scheduleListUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(bodyPayload)
              });
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json(); // Resolves to the parsed response
            let formattedData= [...data?.data];
            formattedData.sort(
                (a, b) =>
                    new Date(a.scheduleTime).getTime() -
                    new Date(b.scheduleTime).getTime()
            );
            
            setSchedules(formattedData as any)

            // const newNextToken = data?.nextToken ;

            // console.log(nextTokens,newNextToken,'newNextToken',nextTokens.includes(newNextToken))
            // if (newNextToken !== undefined && newNextToken !== null) {
            //     let tokens =[...nextTokens]
            //     if(  !(tokens.includes(newNextToken))){
            //         setNextTokens((prev) =>
            //             prev.includes(newNextToken) ? prev : [...prev, newNextToken]
            //         );
            //     }
                
            // }

            const newNextToken = data?.nextToken;

            if (newNextToken !== undefined && newNextToken !== null) {
                setNextTokens((prev) => {
                    // Token from page N is used to load page N+1, so it lives at index (N+1)-2 = N-1
                    const tokenIndex = pageToLoad - 1;
                    // if (pageToLoad === 1) {
                    //     return [newNextToken];
                    // }

                    if (tokenIndex < prev.length) {
                        return [
                            ...prev.slice(0, tokenIndex),
                            newNextToken,
                            ...prev.slice(tokenIndex + 1),
                        ];
                    }
                    return [...prev, newNextToken];
                });
            }

            return data;
        } catch (err) {
            console.error('API call failed:', err);
            throw err; // Or handle error appropriately
        }finally{setIsLoader(false)}
    }

    const handlePageChange = (pageNumber: number) => {
        setPage(pageNumber);
        getSchedules(pageNumber);
    };

    const deleteSchedule=async(name:string)=>{
        try {
            const response = await fetch(deleteScheduleUrl+`?scheduleName=${name}`);
            
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json(); // Resolves to the parsed response
             getSchedules(page)
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'The schedule deleted successfully.',
            });

            return data;
        } catch (err) {
            console.error('API call failed:', err);
            Swal.fire({
                icon: 'error',
                title: 'Failed!',
                text: 'Something went wrong. Please try again.',
            });
            // throw err; // Or handle error appropriately
        }
    }

    useEffect(()=>{
        getSchedules(1)
    },[])

    const getLocaleDateTime=(dateTime:string)=>{
        const dhakaTime = dateTime
            ? new Date(
                new Date(dateTime).getTime() + 6 * 60 * 60 * 1000
                ).toLocaleString('en-US', {
                timeZone: 'Asia/Dhaka',
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
                })
            : '';

        return dhakaTime;
    }
  return (
    <div>
        <Button
            disabled={isLoader}
            onClick={() => {
                setPage(1);
                setNextTokens([]);
                getSchedules(1);
            }}
            className=''
        >
            {isLoader?<Loader style={{marginRight:'3px'}} size="xs" color="gray" />:''}
            Refreash
        </Button>
        <Table.ScrollContainer minWidth={100}>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Title</Table.Th>
                        <Table.Th>time</Table.Th>
                        <Table.Th>Remove</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {schedules.map((item: any, index: number) => (
                        <Table.Tr key={index}>
                            <Table.Td>{decodeWord(item.title)}</Table.Td>
                            <Table.Td>{getLocaleDateTime(item.scheduleTime) as string}</Table.Td>
                            <Table.Td onClick={()=>{deleteSchedule(item?.Name)}}>
                                <IconTrash style={{cursor:'pointer'}} size={20} stroke={1.5} color='#f87171' />
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Table.ScrollContainer>
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            {Array.from({ length: nextTokens.length + 1 }, (_, index) => {
                const pageNumber = index + 1;
                return (
                    <Button
                        key={pageNumber}
                        size='xs'
                        variant={page === pageNumber ? 'filled' : 'outline'}
                        disabled={isLoader}
                        onClick={() => handlePageChange(pageNumber)}
                    >
                        {pageNumber}
                    </Button>
                );
            })}
        </div>
    </div>
  )
}

export default ScheduleList