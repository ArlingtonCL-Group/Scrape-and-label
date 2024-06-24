'use client'
import {useEffect, useState, useRef} from 'react';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import api from './api/api';
import {useSession, signIn, signOut} from "next-auth/react";
import { toast } from 'react-toastify';


// authentication

export default function Page() {
    const {data: session, status} = useSession();
    const loading = status === 'loading';



    useEffect(() => {
        if (!loading && session) {
            if (youtubeJsonData
                ?.length > 0) {
                return;
            };
            fetchYoutubeData();
        }
    }, [session, loading]);

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
            if(!session){
                return;
            }
            const response = await api.get(`/api/fetch?userID=${session?.user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
                toast.error(`HTTP error! status: ${response.status}`);
            }
            const staticData = response.data;
            setyoutubeJsonData(staticData.message);
            youtubeJsonDataRef.current = staticData.message;
        } catch (error) {
            console.error('An error occurred while fetching the YouTube data:', error);
            toast.error('An error occurred while fetching the YouTube data:');
        }
    };
    const handleUpdate = async(jsondata : any, category : any) => {
        if (!(youtubeJsonDataRef.current.length > 0)) {
            console.log("returned in handleupdate")
            toast.success("returned in handleupdate")
            return;
        }
        try {
            console.log(jsondata)
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
            toast.error(`An error occurred: ${error}`);
        }
    };

    const handleBad = (jsondata : any) => {
        handleUpdate(jsondata, "bad")
    };

    const handleGood = (jsondata : any) => {
        handleUpdate(jsondata, "good");

    };

    const handleSkip = (jsondata : any) => {
        handleUpdate(jsondata, "skip");

    };

    async function handleKeyDown(e : any) {
        console.log("handleKeyDown triggered")
        
        if (!(youtubeJsonDataRef.current.length > 0)) {
            console.log("returned")
            toast.success("handleKeyDown triggered");
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

    // const handleDownload = async(e : any) => {
    //     e.preventDefault();
    //     fetch('http://localhost:8080/get_reviewed_results', {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         cache: 'no-cache'
    //     }).then(async(e) => {
    //         const staticData = await e
    //             ?.json();
    //         console.log(staticData);
    //         setcsvData(staticData);
    //         setDownload(true);
    //     });
    // };

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
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
                        id={`${youtubeJsonData[0]
                        ?.video_id}`}
                        title={`${youtubeJsonData[0]
                        ?.title}`}/>
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
