'use client'
import Image from 'next/image'
import {useEffect, useState, useRef} from 'react';
import {CSVLink, CSVDownload} from "react-csv";
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import api from './api/api';
import { useRouter } from 'next/navigation';
import {checkToken} from './api/checkJWT';
import {getDatabase} from './api/database';

export default function Home() {
    const router =  useRouter();
    const [db,
        setdb] = useState < any > (null);
    // Use router inside useEffect to ensure it's not being used in server-side rendering
    useEffect(() => {
        const fetchData = async () => {
            const connectToDb = async () => {
                if (!db) {
                    await getDatabase();
                    setdb(true);
                }
            };
            connectToDb();

            const token = localStorage.getItem('token');
            if (token && await checkToken(token)) {
                router.push('/');
            }
        };

        fetchData();

    }, []);
    const checkTokenAndCallApi = async (apiFunction:any, ...params:any) => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        return await apiFunction(...params);
    };
    useEffect(() => {
     
        if (youtubeJsonData
            ?.length > 0) {
            return;
        };
        checkTokenAndCallApi(fetchYoutubeData);
    }, []);
    const [youtubeJsonData,
        setyoutubeJsonData] = useState < any > ([]);
    const youtubeJsonDataRef = useRef(youtubeJsonData);
    const [csvData,
        setcsvData] = useState < any > ([])
    const [download,
        setDownload] = useState(false);
    const [youtube_video_url,
        setyoutube_video_url] = useState < any > ("");
    const change_youtube_video_url = (e : any) => {
        e.preventDefault();
        setyoutube_video_url(e.target.value);
    };

    const fetchYoutubeData = async() => {
        try {
            const response = await api.get('api/fetch', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const staticData = response.data;
            setyoutubeJsonData(staticData.message);
            youtubeJsonDataRef.current = staticData.message;
        } catch (error) {
            console.error('An error occurred while fetching the YouTube data:', error);
        }
    };
const handleUpdate = async(jsondata : any, category : any) => {
    if (!(youtubeJsonDataRef.current.length > 0)) {
        console.log("returned in handleupdate")
        return;
    }
    try {
        const response = await api.post(`/api/${category}`, jsondata, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;

        let newyoutubedata = data.message || [];
        setyoutubeJsonData(newyoutubedata);
        youtubeJsonDataRef.current = newyoutubedata;
    } catch (error) {
        console.error(`An error occurred: ${error}`);
    }
};

    const handleBad = (jsondata : any) => {
        checkTokenAndCallApi(handleUpdate, jsondata, "bad");
    };

    const handleGood = (jsondata : any) => {
        checkTokenAndCallApi(handleUpdate, jsondata, "good");


    };

    const handleSkip = (jsondata : any) => {
        checkTokenAndCallApi(handleUpdate, jsondata, "skip");

    };

    async function handleKeyDown(e : any) {
        console.log("handleKeyDown triggered")
        if (!(youtubeJsonDataRef.current.length > 0)) {
            console.log("returned")
            return;
        }
        console.log("handleKeyDown triggered went through")

        switch (e.key) {
            case "ArrowLeft":
                handleBad(youtubeJsonDataRef.current[0]);
                break;
            case "ArrowRight":
                handleGood(youtubeJsonDataRef.current[0]);
                break;
        }
    };

    useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
    }, []);

    const handleDownload = async(e : any) => {
        e.preventDefault();
        fetch('http://localhost:8080/get_reviewed_results', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            cache: 'no-cache'
        }).then(async(e) => {
            const staticData = await e
                ?.json();
            console.log(staticData);
            setcsvData(staticData);
            setDownload(true);
        });
    };

    return (
        <main
            className="flex min-h-screen flex-col items-center justify-between p-24">
            {youtubeJsonData
                ?.length && <div>
                    {youtubeJsonData
                        ?.length + " total"
}
                </div>}

            <br/>

            <div className="card w-150 bg-base-100 shadow-xl">
                {youtubeJsonData[0]
                    ?.video_id && <LiteYouTubeEmbed
                    id={`${youtubeJsonData[0]?.video_id}`}
                    title={`${youtubeJsonData[0]?.title}`}
                  />
}
                <div className="card-body">
                    <h2 className="card-title">{youtubeJsonData[0]
                            ?.title}

                    </h2>
                    <span>
                        <a
                            target='_blank'
                            href={`https://www.youtube.com/watch?v=${youtubeJsonData[0]
                            ?.video_id}`}>
                            {`https://www.youtube.com/watch?v=${youtubeJsonData[0]
                                ?.video_id}`}
                        </a>
                    </span>
                    <div className="card-actions justify-center">
                        <button
                            onClick={(e) => handleSkip(youtubeJsonData[0])}
                            className="btn btn-primary">Skip</button>
                        <button
                            onClick={(e) => handleBad(youtubeJsonData[0])}
                            className="btn btn-accent">Bad</button>
                        <button
                            onClick={(e) => handleGood(youtubeJsonData[0])}
                            className="btn btn-secondary">Good</button>
                    </div>
                    <div className="d-flex justify-center flex-col">
                        <div className="badge ">Left arrow (Bad)</div>
                        <div className="badge ">Right arrow (Good)</div>
                    </div>
                </div>
            </div>
            <br/>
        </main>
    )
}
