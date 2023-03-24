import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import articleService from '../services/article.service';
import IArticleData from '../interfaces/articleInterface';
import SingleArticleCard from '../components/articles/SingleArticleCard';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import RecapProposition from '../components/RecapProposition';
import IconAwe from 'react-native-vector-icons/FontAwesome5';
import IconMat from 'react-native-vector-icons/MaterialIcons';
import {supabase} from '../lib/initSupabase';
import profileService from '../services/profile.service';
import SwitchSelector from 'react-native-switch-selector';
import Icon from 'react-native-vector-icons/EvilIcons';
export default function Profil({session}: {session: any}) {
  const [selectedComponent, setSelectedComponent] = useState('articles');
  const [articles, setArticles] = useState<IArticleData[]>([]);
  const [userInfos, setUserInfos] = useState<any>([]);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    setSelectedComponent('articles');
    articleService.getAllMyPublishedArticles(session.user.id).then(result => {
      setArticles(result);
    });
    profileService.getProfile(session.user.id).then(result => {
      console.log(result);
      setUserInfos(result);
    });
  }, [isFocused]);
  return (
    <ScrollView>
      <View style={styles.ContainerTop}>
        <View style={styles.Top}>
          <IconAwe
            name="edit"
            size={20}
            color="#fff"
            onPress={() => {
              navigation.navigate('UpdateProfil');
            }}
          />
          <Text style={styles.Title}>Profil</Text>
          <IconMat
            name="logout"
            size={20}
            color="#fff"
            onPress={() => supabase.auth.signOut()}
          />
        </View>
        <View style={styles.ContainerImage}>
          <View style={styles.ImageBackground}>
            {userInfos.avatar_url != null && (
              <Image
                style={styles.Image}
                source={{uri: userInfos?.avatar_url}}
              />
            )}
          </View>
        </View>
      </View>
      <View style={styles.ContainerBottom}>
        <Text style={styles.full_name}>{userInfos.username}</Text>
        <Text style={styles.Localisation}>
          <Icon name="location" size={14} color="#696969" />
          <Text style={styles.city_name}>{userInfos?.city_name}</Text>
        </Text>
        <SwitchSelector
          initial={0}
          onPress={(value: any) => setSelectedComponent(value)}
          textColor={'#000'}
          selectedColor={'#fff'}
          buttonColor={'#5DB075'}
          backgroundColor={'#fff'}
          borderColor={'#5DB075'}
          borderRadius={4}
          touchableProps={{activeOpacity: 1}}
          borderWidth={1}
          style={styles.SwitchContainer}
          height={46}
          hasPadding={true}
          options={[
            {label: 'Articles publiés', value: 'articles'},
            {label: 'Propositions', value: 'propositions'},
          ]}
          accessibilityLabel="gender-switch-selector"
        />
        <View style={styles.InfosContainer}>
          {selectedComponent === 'articles' &&
            articles.map(article => (
              <React.Fragment key={article.id}>
                <SingleArticleCard
                  navigation={navigation}
                  article={article}
                  modeAffichage={'mode2'}
                  session={session}
                />
              </React.Fragment>
            ))}
          {selectedComponent === 'propositions' && (
            <RecapProposition session={session} navigation={navigation} />
          )}
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  Localisation: {
    color: '#696969',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  ContainerTop: {
    backgroundColor: '#5DB075',
    height: 200,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 80,
  },
  ContainerBottom: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  Top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
  },
  Title: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 28,
  },
  ContainerImage: {
    alignItems: 'center',
  },
  ImageBackground: {
    width: 150,
    height: 150,
    backgroundColor: '#fff',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  Image: {
    width: 140,
    height: 140,
    borderRadius: 100,
  },
  full_name: {
    color: '#000',
    fontFamily: 'Roboto',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  city_name: {
    color: '#000',
    fontFamily: 'Roboto',
    fontSize: 14,
    textAlign: 'center',
  },
  SwitchContainer: {
    marginTop: 20,
    marginBottom: 20,
    elevation: 1,
  },
  SwitchTextContainer: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  InfosContainer: {
    marginBottom: 32,
  },
});
