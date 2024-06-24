'use client'
import {useState, useEffect} from 'react';
import api from '../../api/api';
import CustomSelect from '@/app/components/CustomSearch';
import {useSession, signIn, signOut} from "next-auth/react";
import CustomGroupSearch from '@/app/components/CustomGroupSearch';
import CustomUserSearch from '@/app/components/UserSearch';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Item = {
    title: string;
    thumbnails: string;
    duration: string;
    viewCount: string;
    channel: string;
    video_id: string;
    status: string;
    label: string;
    createdBy: string;
    labeledBy: string;
    exclude: boolean;
    keyword: string;
    assignedTo: string;
    keywordGroup: string;
};
type keywordtype = {
    id: string,
    name: string
}

type User = {
    _id: string;
    username: string;
    role: string;
    isActive: boolean;
};

export default function Page() {
    const [keyword,
        setKeyword] = useState('');
    const [keywordSuperset,
        setkeywordSuperset] = useState('');
    const [keywordSupersetid,
        setkeywordSupersetid] = useState('');
    const [dropDown,
        setdropDown] = useState('Select');
    const [keywords,
        setKeywords] = useState < keywordtype[] > ([]);
    const [keywordGroups,
        setKeywordGroups] = useState < keywordtype[] > ([]);
    const [items,
        setItems] = useState < Item[] > ([]);
    const [Cookie,
        setCookie] = useState('');
    const {data: session, status} = useSession();
    const [isLoading,
        setIsLoading] = useState(false);
    const [users,
        setUsers] = useState < User[] > ([]);
    const [selectedUserId,
        setselectedUserId] = useState("");
    const fetchUsers = async() => {
        const response = await api.get('/api/admin/users/getActive');
        setUsers(response.data);
        toast.success('Users successfully fetched');
    };
    const [selectedKeywordGroupToAssign,
        setselectedKeywordGroupToAssign] = useState("");

    const [assignAmount,
        setassignAmount] = useState(0);

    const handleAssign = async() => {
        if (!selectedUserId) {
            alert('Please select a user');
            return;
        }
        const response = await api.post('/api/admin/users/assign', {
            userId: selectedUserId,
            assignAmount,
            keywordGroupId: selectedKeywordGroupToAssign
        });
        if (response.status === 200) {
            console.log('Assigned successfully');
            toast.success('Item successfully assigned!');
            showItemsbyGroup(selectedKeywordGroupToAssign);
        } else {
            console.error('Failed to assign');
            toast.error('Failed to assign');
            
        }

    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCookieChange = (e : any) => {
        setCookie(e.target.value);
    };

    const sendCookie = async() => {
        if (!(session
            ?.user.role === 'admin' || session
                ?.user.role === 'usurper')) 
            return;
        const response = await api.post('/api/admin/users/cookie', {
            cookie: Cookie,
            userId: session
                ?.user.id
        });
        if (response.status === 200) {
            console.log('Cookie sent successfully');
            toast.success('Cookie sent successfully');
        } else {
            console.error('Failed to send cookie');
            toast.error('Failed to send cookie');
        };
    };

    const fetchCookie = async() => {
        const response = await fetch(`/api/admin/users/cookie?userId=${session
            ?.user.id}`);
        if (response.ok) {
            const data = await response.json();
            if (!data
                ?.cookie) 
                return;
            setCookie(data.cookie);
            toast.success('Cookie fetched successfully');
        } else {
            console.error('Failed to fetch cookie');
            toast.error('Failed to fetch cookie');
        }
    };
    useEffect(() => {

        if (session
            ?.user.role === 'admin' || session
                ?.user.role === 'usurper') {
            fetchCookie();
        }
    }, [session]);

    const fetchKeywords = async() => {
        try {
            const response = await api.get('/api/admin/keywords/list',   {
                headers: {
                'Content-Type': 'application/json'
            }
        });
            console.log(response)
            if (response.status === 200) {
                setKeywords([
                    {
                        "name": "Select",
                        "id": "",
                        "superset": "",
                        "supersetid": ""
                    },
                    ...response.data
                    
                ]);
                toast.success('Keywords fetched successfully');
            } else {
                console.error('Failed to fetch keywords');
                toast.error('Failed to fetch keywords')
            }
        } catch (error:any) {
            console.log(error)
        }
    };
    const fetchKeywordGroups = async() => {
        const response = await api.get('/api/admin/keywords/group/list',   {
            headers: {
            'Content-Type': 'application/json'
        }
    });
            console.log(response)
        if (response.status === 200) {
            setKeywordGroups([
                {
                    "name": "Select",
                    "id": ""
                },
                ...response.data
            ]);
            toast.success('Keyword groups fetched successfully');
        } else {
            console.error('Failed to fetch keywords groups');
            toast.error('Failed to fetch keyword groups')
        }
    };
useEffect(() => {
    if(!session) return;
    // const connect = async() => {     await connectToDatabase(); }; connect();
    async function fetchData() {
        await fetchKeywordGroups();
        await fetchKeywords();
    }

    if (keywords?.length === 0) {
        fetchData();
    }
}, [session]);

    const addKeyword = async() => {
        const response = await api.post('/api/admin/keywords/add', {keyword, keywordGroupId: keywordSupersetid});
        if (response.status === 200) {
            setKeywords((prevKeywords : any) => [
                ...prevKeywords,
                keyword
            ]);
            toast.success('Sucessfully added keyword');
        } else {
            console.error('Failed to add keyword');
            toast.error('Failed to add keyword');
        }
    };

    const addGroup = async() => {
        const response = await api.post('/api/admin/keywords/group/add', {keywordSuperset});
        if (response.status === 200) {
            setKeywordGroups((prevKeywords : any) => [
                ...prevKeywords,
                keyword
            ]);
            toast.success('Keyword added successfully');
        } else {
            console.error('Failed to add keyword');
            toast.error('Failed to add keyword');
        }
    };

    const removeKeyword = async() => {
        const response = await api.delete(`/api/admin/keywords/remove?keyword=${dropDown}`);
        if (response.status === 200) {
            setKeywords((prevKeywords : any) => (prevKeywords || []).filter((keyword : any) => keyword.name !== dropDown));
            toast.success('Keyword removed successfully');
        } else {
            console.error('Failed to remove keyword');
            toast.error('Failed to remove keyword');
        }
    };

    const handleKeywordChange = async(selectedKeyword : any) => {
        if(!selectedKeyword) return;
        setdropDown(selectedKeyword);
    };
    const handleUsersChange = async(selectedUser : any) => {
        if(!selectedUser) return;
        setselectedUserId(selectedUser);
    };

    const handleKeywordGroupChange = async(selectedKeywordGroup : any) => {
        setkeywordSupersetid(selectedKeywordGroup)
    };
    const showItemsbyGroup = async(selectedKeywordGroup:any) => {
        if(!selectedKeywordGroup) return;
        const response = await api.get(`/api/admin/keywords?keywordGroupId=${selectedKeywordGroup}`, {
  timeout: 500000
});
        setItems(response.data);
    }
    const handleShowScrappedBygroup = async(selectedKeywordGroup : any) => {
        if (!selectedKeywordGroup) {
            return;
        }
        setselectedKeywordGroupToAssign(selectedKeywordGroup);
        showItemsbyGroup(selectedKeywordGroup);

    }
    const handleKeywordType = (e : any) => {
        setKeyword(e.target.value)
    }
    const handleGroupType = (e : any) => {
        setkeywordSuperset(e.target.value)
    }

    const handleScrape = async() => {
        setIsLoading(true);
        let keyword = dropDown;
        try {
            const response = await api.post('/api/admin/scrape', {
                keyword,
                userId: session
                    ?.user.id,
                Cookie
            });
            if (response.status === 200) {
                fetchKeywords();
                toast.success('Started scraping successfully');
            } else {
                console.error('Failed to start scraping');
                toast.error('Failed to start scraping');
            }
        } catch (error) {
            console.error('Failed to start scraping', error);
            toast.error('Failed to start scraping');
        } finally {
            setIsLoading(false);
        }
    }

    const handleNumberChange = (e : any) => {
        const value = e.target.value;
        if (value > 0) {
            setassignAmount(value);
        }
    }

    return (
        <div
            className="flex flex-col items-center justify-center  bg-gray-800 text-white">
            <div className="flex flex-row justify-center items-center space-x-4">
                <div className="flex flex-col items-center justify-center mt-14">
                    <label className="flex flex-col">
                        Cookie:
                        <input
                            type="text"
                            value={Cookie}
                            onChange={e => handleCookieChange(e)}
                            className="p-2 border border-gray-300 rounded text-emerald-600"/>
                    </label>
                    <button
                        onClick={sendCookie}
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-1">Set Cookie</button>
                </div>

                <div>
                    <form onSubmit={addGroup} className="flex flex-col space-y-2">
                        <div className='flex space-x-4'>
                            <label className="flex flex-col">
                                Group (eg: "dog","cat","bird"):
                                <input
                                    type="text"
                                    value={keywordSuperset}
                                    onChange={e => handleGroupType(e)}
                                    className="p-2 border border-gray-300 rounded text-emerald-600"
                                    required/>
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Group</button>
                    </form>
                </div>
            </div>
            <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"/>
            <div>
                <form onSubmit={addKeyword} className="flex flex-col space-y-2">
                    <div className='flex space-x-4'>
                        <label className="flex flex-col">
                            Keyword:
                            <input
                                type="text"
                                value={keyword}
                                onChange={e => handleKeywordType(e)}
                                className="p-2 border border-gray-300 rounded text-emerald-600"
                                required/>
                        </label>
                        <div className="w-full">
                            <CustomGroupSearch
                                options={keywordGroups}
                                onChange={(selectedOption) => handleKeywordGroupChange(selectedOption)}/>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Keyword</button>
                </form>
                <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"/>
                <div className='mt-4'>
                    <CustomSelect
                        options={keywords}
                        onChange={(selectedOption) => handleKeywordChange(selectedOption)}/>
                </div>
                {!isLoading && <div className='flex flex-row items-center justify-center space-x-4'>
                    <button
                        disabled={dropDown == "Select"}
                        onClick={() => handleScrape()}
                        className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-orange-600">Scrape Keyword</button>
                    <button
                        disabled={dropDown == "Select"}
                        onClick={() => removeKeyword()}
                        className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600">Remove Keyword</button>
                </div>}
                {isLoading &&< div > <span className="loading loading-bars loading-lg"></span>Scrapping .... </div>}
            </div>
            <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"/>

            <div className="flex">
                <div className="mt-7 min-w-fit">
                    <CustomGroupSearch
                        options={keywordGroups}
                        onChange={(selectedOption) => handleShowScrappedBygroup(selectedOption)}/>
                </div>
                {items
                    ?.length > 0 && <div className="text-center mt-8 text-red-900">
                        <span>{items
                                ?.length } items found</span>
                        <div className='mt-4'>
                            <div className="flex space-x-4">
                                <div>
                                    <label>Assign to user:</label>
                                    <CustomUserSearch
                                        options={users}
                                        onChange={(selectedOption) => handleUsersChange(selectedOption)}/>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <label className="flex flex-col">
                                        Enter a number:
                                        <input
                                            type="number"
                                            value={assignAmount}
                                            onChange={e => handleNumberChange(e)}
                                            className="p-2 border border-gray-300 rounded text-emerald-600"/>
                                    </label>
                                </div>
                                <div className='flex items-center justify-center'>
                                    <button
                                        type="submit"
                                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-4"
                                        onClick={() => handleAssign()}>Assign</button>
                                </div>
                            </div>
                        </div>
                    </div>}
            </div>
            <div
                style={{
                overflowY: 'auto',
                maxHeight: '50vh'
            }}
                className='mb-10'>
                {items
                    ?.length === 0 && <div className="text-center mt-8 text-red-900">No items found</div>}
                <table
                    className="mt-8 w-4/5 text-center text-red-900 border-2 border-blue-300 border-collapse mx-auto bg-white">
                    <thead>
                        <tr>
                            <th className="border border-blue-300 w-1/8">Title</th>
                            <th className="border border-blue-300 w-1/8">Channel</th>
                            <th className="border border-blue-300 w-1/8">Duration</th>
                            <th className="border border-blue-300 w-1/8">View Count</th>
                            <th className="border border-blue-300 w-1/8">Status</th>
                            <th className="border border-blue-300 w-1/8">Label</th>
                            <th className="border border-blue-300 w-1/8">keyword</th>
                            <th className="border border-blue-300 w-1/8">Created By</th>
                            <th className="border border-blue-300 w-1/8">Assigned To</th>
                            {/* <th className="border border-blue-300 w-1/8">videoid</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {items?.map(item => (
                            <tr key={item.video_id + item.keywordGroup}>
                                <td className="border border-blue-300">
                                    <a
                                        href={`https://www.youtube.com/watch?v=${item.video_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        {item.title}
                                    </a>
                                </td>
                                <td className="border border-blue-300">{item.channel}</td>
                                <td className="border border-blue-300">{item.duration}</td>
                                <td className="border border-blue-300">{item.viewCount}</td>
                                <td className="border border-blue-300">{item.status}</td>
                                <td className="border border-blue-300">{item.label}</td>
                                <td className="border border-blue-300">{item.keyword}</td>
                                <td className="border border-blue-300">{item.createdBy}</td>
                                <td className="border border-blue-300">{item.assignedTo}</td>
                                {/* <td className="border border-blue-300">{item.video_id}</td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
