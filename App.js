// 헤더 컴포넌트 - 정현 21.11.18

import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
  NativeModules,
} from 'react-native';
import {Slider} from '@miblanchard/react-native-slider';
import Sound from 'react-native-sound';
import MusicControl from 'react-native-music-control';

import useInterval from './src/hooks/useInterval';

import PlayPurple from './src/assets/images/ui_play.png';
import NextPurple from './src/assets/images/ui_playjumpleft.png';
import StopPurple from './src/assets/images/ui_pause.png';
import PrevPurple from './src/assets/images/ui_playjumpright.png';

const {StatusBarManager} = NativeModules;
const Player = ({
  fileUri = require('./src/assets/music/Why.mp3'),
  theme,
  isOpen = true,
}) => {
  const [isPlay, setIsPlay] = useState(false);
  const [audio, setAudio] = useState('');

  const [duration, setDuration] = useState(null);
  const [slideValue, setSlideValue] = useState(0);
  const [sliderEditing, setSliderEditing] = useState(false);

  const onSliderEditStart = () => {
    setSliderEditing(true);
  };
  const onSliderEditEnd = () => {
    setSliderEditing(false);
  };
  const onSliderEditing = value => {
    if (audio) {
      audio.setCurrentTime(value[0]);
      setSlideValue(value[0]);
    }
  };
  useEffect(() => {
    getAudio(fileUri);
  }, [fileUri]);

  useEffect(() => {
    getAudio(fileUri);
    return () => {
      audio && audio.pause(() => {});
    };
  }, []);
  useEffect(() => {
    return () => {
      audio && audio.pause(() => {});
      audio && setIsPlay(false);
      setSlideValue(0);
    };
  }, [isOpen]);
  const getAudio = file => {
    if (file === '' || file === null) {
      return;
    }
    console.log(file);
    let sound = new Sound(file, Sound.MAIN_BUNDLE, error => {
      if (error) {
        setDuration(0);
      } else {
        let tmp = sound.getDuration();
        const se = Math.round(tmp);
        setDuration(se);
      }
    });
    console.log(sound);
    Sound.setCategory('Playback');
    setAudio(sound);
  };
  const audioPlay = () => {
    console.log(audio);
    if (audio._filename !== '' && audio !== null) {
      setIsPlay(!isPlay);
      console.log('asdfsadfd ???');
      const data = {
        title: 'Why',
        artist: '네이버쿼카',
      };
      if (isPlay === false) {
        MusicControl.setNowPlaying({
          title: data.title,
          artwork:
            'https://image.bugsm.co.kr/album/images/200/204090/20409067.jpg?version=20210715120020.0', // URL or RN's image require()
          artist: data.artist,
          album: 'Thriller',
          genre: 'Post-disco, Rhythm and Blues, Funk, Dance-pop',
          duration: 294, // (Seconds)
          description: '', // Android Only
          color: 0xffffff, // Android Only - Notification Color
          colorized: false, // Android 8+ Only - Notification Color extracted from the artwork. Set to false to use the color property instead
          date: '1983-01-02T00:00:00Z', // Release Date (RFC 3339) - Android Only
          rating: 84, // Android Only (Boolean or Number depending on the type)
          notificationIcon: 'my_custom_icon', // Android Only (String), Android Drawable resource name for a custom notification icon
          isLiveStream: true, // iOS Only (Boolean), Show or hide Live Indicator instead of seekbar on lock screen for live streams. Default value is false.
        });
        MusicControl.enableControl('closeNotification', false, {
          when: 'always',
        });

        audio.play(success => {
          console.log(success);
          setSlideValue(0);
          setIsPlay(false);
        });
      } else {
        audio.pause(() => {});
      }
    } else {
      getAudio(fileUri);
    }
  };

  useInterval(
    () => {
      if (audio && audio.isLoaded() && isPlay && !sliderEditing) {
        audio.getCurrentTime((seconds, isPlaying) => {
          setSlideValue(seconds);
        });
      }
    },
    isPlay ? 1000 : null,
  );

  const getAudioTimeString = seconds => {
    const h = parseInt(seconds / (60 * 60));
    const m = parseInt((seconds % (60 * 60)) / 60);
    const s = parseInt(seconds % 60);

    return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
  };

  const audioControll = sec => {
    setSlideValue(slideValue + sec);
    audio.getCurrentTime((seconds, isPlaying) => {
      seconds + sec < 0
        ? audio.setCurrentTime(0)
        : seconds + sec > duration
        ? audio.setCurrentTime(duration)
        : audio.setCurrentTime(seconds + sec);
    });
  };

  return (
    <View style={[styles.container]}>
      <View style={{width: '100%', paddingHorizontal: 10}}>
        <Slider
          containerStyle={{height: 38}}
          value={slideValue}
          minimumValue={0}
          maximumValue={duration > 0 ? duration : 5}
          maximumTrackTintColor={'#707070'}
          minimumTrackTintColor={'#6244BB'}
          thumbTintColor={'#6244BB'}
          step={1}
          trackClickable={false}
          onTouchStart={onSliderEditStart}
          onTouchEnd={onSliderEditEnd}
          onValueChange={onSliderEditing}
          trackStyle={{height: 3, width: '100%', alignSelf: 'center'}}
          thumbStyle={{
            backgroundColor: '#6244BB',
            borderColor: '#6244BB',
            borderRadius: 8,
            borderWidth: 8,
            height: 5,
            width: 5,
          }}
        />
      </View>

      {/* <Slider
        style={{width: '100%', height: 38}}
        value={slideValue}
        maximumValue={duration}
        minimumValue={0}
        maximumTrackTintColor={isWhiteTheme ? '#707070' : '#FFFFFF'}
        minimumTrackTintColor={isWhiteTheme ? '#6244BB' : '#0AC0B6'}
        thumbTintColor={isWhiteTheme ? '#6244BB' : '#0AC0B6'}
        onTouchStart={onSliderEditStart}
        onTouchEnd={onSliderEditEnd}
        onValueChange={onSliderEditing}
      /> */}
      <View style={styles.audiotxtbox}>
        <Text style={styles.durationtxt}>{getAudioTimeString(slideValue)}</Text>
        <Text style={styles.durationtxt}>{getAudioTimeString(duration)}</Text>
      </View>
      <View style={[styles.PlayerBtnGroup]}>
        <TouchableOpacity onPress={() => fileUri && audioControll(-10)}>
          <Image source={PrevPurple} style={styles.PlayerController} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => fileUri && audioPlay()}>
          <Image
            source={isPlay === false ? PlayPurple : StopPurple}
            style={styles.PlayerBtn}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            fileUri && audioControll(10);
          }}>
          <Image source={NextPurple} style={styles.PlayerController} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'skyblue',
    width: '80%',
    borderRadius: 10,
    borderColor: 'skyblue',
    borderWidth: 1,
    // justifyContent: 'center',
    alignSelf: 'center',
    minHeight: 50,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 20,
  },
  PlayerBtnGroup: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  PlayerController: {
    height: 20,
    width: 20,
  },
  PlayerBtn: {
    height: 20,
    width: 20,
    marginLeft: 6.7,
    marginRight: 6.7,
  },
  audiotxtbox: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    bottom: 5,
  },
  durationtxt: {
    // ...Style.F10,
    color: '#C8C8C8',
    fontSize: 1.4,
  },
});

export default Player;
