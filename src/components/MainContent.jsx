import React, {useState, useEffect} from 'react'
import Grid from '@mui/material/Unstable_Grid2';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Prayer from './Prayer';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import axios from "axios"
import moment from "moment"
import  maka  from "../../public/maka.mp3"
import "moment/dist/locale/ar-dz"
moment.locale("ar-dz")

function MainContent ()  {

    const [nextPrayerIndex, setNextPrayerIndex] = useState(2)

    const [timings, setTimings] = useState({
        Fajr: "03:13",
        Dhuhr: "02:50",
        Asr: "03:14",
        Maghrib: "19:40",
        Isha: "21:13",
    })

    const [remainigTime, setRemaingTime] = useState("")

    const [selectedCity, setSelectedCity] = useState({
        displayName: "مغنية",
        apiName: "Maghnia",
        backgroundImage: "url('../../public/maghnia1.jpg')" 
    })

    const [today, setToday] = useState("")

    const avilableCities = [
        {
            displayName: "مغنية",
            apiName: "Maghnia",
            backgroundImage: "url('../../public/maghnia1.jpg')" 
        },
        {
            displayName: "وهران",
            apiName: "Oran",
            backgroundImage: "url('../../public/oran1.jpg')" 
        },
        {
            displayName: "الجزائر العاصمة",
            apiName: "Alger",
            backgroundImage: "url('../../public/alger.jpg')" 
        }
    ]

    const prayersArray = [
        { key: 'Fajr', displayName: "الفجر" },
        { key: 'Dhuhr', displayName: "الظهر" },
        { key: 'Asr', displayName: "العصر" },
        { key: 'Maghrib', displayName: "المغرب" },
        { key: 'Isha', displayName: "العشاء" },
    ]

    const getTimings = async () => {
        const response = await axios.get(`https://api.aladhan.com/v1/timingsByCity?country=DZ&city=${selectedCity.apiName}`)
        setTimings(response.data.data.timings)
    }

    useEffect(() => {
        getTimings();
    }, [selectedCity])

    useEffect(() => {
        let interval = setInterval(() => {
            setupCountdownTimer();
        }, 1000);
        const t = moment();
        setToday(t.format("LLLL"))
        return () => {
            clearInterval(interval)
        }
    }, [timings])

    useEffect(() => {
        const adhanAudio = new Audio('../../public/maka.mp3');

        const checkPrayerTime = () => {
            const currentTime = moment().format('HH:mm');
            const prayerTimes = Object.values(timings);

            if (prayerTimes.includes(currentTime)) {
                adhanAudio.play().catch(error => console.error('Error playing audio:', error));
                console.log("حان وقت الصلاة");
            }
        };
        
        const intervalId = setInterval(checkPrayerTime, 30000);

        return () => clearInterval(intervalId);
    }, [timings]);

    const setupCountdownTimer = () => {
        const momentNow = moment()
        let prayerIndex = 2;
        momentNow.isBefore(moment(timings["Dhuhr"], "hh:mm"))
        if (
            momentNow.isAfter(moment(timings["Fajr"], "hh:mm")) &&
            momentNow.isBefore(moment(timings["Dhuhr"], "hh:mm"))
        ) {
            prayerIndex = 1
        } else if (
            momentNow.isAfter(moment(timings["Dhuhr"], "hh:mm")) &&
            momentNow.isBefore(moment(timings["Asr"], "hh:mm"))
        ) {
            prayerIndex = 2

        } else if (
            momentNow.isAfter(moment(timings["Asr"], "hh:mm")) &&
            momentNow.isBefore(moment(timings["Maghrib"], "hh:mm"))
        ) {
            prayerIndex = 3
        } else if (
            momentNow.isAfter(moment(timings["Maghrib"], "hh:mm")) &&
            momentNow.isBefore(moment(timings["Isha"], "hh:mm"))
        ) {
            prayerIndex = 4
        } else {
            prayerIndex = 0
        }
        setNextPrayerIndex(prayerIndex)
        const nextPrayerObject = prayersArray[prayerIndex];
        const nextPrayerTime = timings[nextPrayerObject.key];
        const nextPrayerTimeMoment = moment(nextPrayerTime, "hh:mm")
        let remainigTime = moment(nextPrayerIndex, "hh:mm").diff(momentNow)
        if (remainigTime < 0) {
            const midnightDiff = moment("23:59:59", "hh:mm:ss").diff(momentNow)
            const fajrToMidnghtDiff = nextPrayerTimeMoment.diff(
                moment("00:00:00", "hh:mm:ss")
            );
            const totalDiffernce = midnightDiff + fajrToMidnghtDiff
            remainigTime = totalDiffernce
        }
        const durationRemainingTime = moment.duration(remainigTime)
        setRemaingTime(`${durationRemainingTime.seconds()} : ${durationRemainingTime.minutes()} : ${durationRemainingTime.hours()} `)
    }
    const handleCityChange = (event) => {
        const cityObject = avilableCities.find((city) => {
            return city.apiName == event.target.value
        })
        setSelectedCity(cityObject);
    };

    
    useEffect(() => {
        const body = document.querySelector('body');
        if (body) {
            body.style.backgroundImage = selectedCity.backgroundImage;
            body.style.backgroundRepeat = "no-repeat";
            body.style.backgroundSize = "cover";
        }
    }, [selectedCity]);

    return (
        <>
            <Grid container >
                <Grid xs={6} >
                    <div style={{margin: "4px",padding: "50px"}}>
                        <h2>{today}</h2>
                        <h1>{selectedCity.displayName}</h1>
                    </div>
                </Grid>
                <Grid xs={6}>
                    <div style={{margin: "4px",padding: "50px"}}>
                        <h2> متبقي حتى صلاة {prayersArray[nextPrayerIndex].displayName}</h2>
                        <h1>{remainigTime}</h1>
                    </div>
                </Grid>
            </Grid>
            <Divider style={{borderColor: "white", opacity: "0.1"}}/>
            <Stack direction="row" justifyContent={'space-around'} style={{marginTop: "50px"}}>
                <Prayer name="الفجر" image="../../public/fajr-prayer.png" time={timings.Fajr}/>
                <Prayer name="الظهر" image="../../public/dhhr-prayer-mosque.png" time={timings.Dhuhr}/>
                <Prayer name="العصر" image="../../public/asr-prayer-mosque.png" time={timings.Asr }/>
                <Prayer name="المغرب" image="../../public/sunset-prayer-mosque.png" time={timings.Maghrib }/>
                <Prayer name="العشاء" image="../../public/night-prayer-mosque.png" time={timings.Isha}/>
            </Stack>
            <Stack direction="row"  justifyContent={"center"} style={{marginTop: "40px"}}>
                <FormControl style={{width: '20%'}}>
                    <InputLabel id="demo-simple-select-label">
                        <span style={{color: "white",fontSize: '30px'}}>المدينة</span>
                    </InputLabel>
                    <Select
                        style={{color: "white",fontSize: '30px'}}
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        label="Age"
                        onChange={handleCityChange}
                    >
                        {avilableCities.map((city) => {
                           return( 
                                <MenuItem 
                                    key={city.apiName}
                                    value={city.apiName}
                                >
                                   {city.displayName}
                                </MenuItem>)
                        })}
                    </Select>
                </FormControl>
            </Stack>
        </>
  )
}

export default MainContent
