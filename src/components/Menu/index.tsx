import React, { useContext } from 'react';
import { Menu as UikitMenu } from 'taalswap-uikit';
import { useWeb3React } from '@web3-react/core';
import { allLanguages } from 'constants/localisation/languageCodes';
import { LanguageContext } from 'hooks/LanguageContext';
import useTheme from 'hooks/useTheme';
import useGetPriceData from 'hooks/useGetPriceData';
import useGetLocalProfile from 'hooks/useGetLocalProfile';
import useAuth from 'hooks/useAuth';
import links from './config';
import { TAL } from '../../constants';

const Menu: React.FC = (props) => {
  const { account } = useWeb3React();
  const { login, logout } = useAuth();
  const { selectedLanguage, setSelectedLanguage } = useContext(LanguageContext);
  const { isDark, toggleTheme } = useTheme();
  const priceData = useGetPriceData();
  console.info('priceData : ', priceData);
  console.info('priceData : ', TAL.address);
  const cakePriceUsd = priceData ? Number(priceData.data[TAL.address].price) : undefined;
  const profile = useGetLocalProfile();

  return (
    <UikitMenu
      links={links}
      account={account as string}
      login={login}
      logout={logout}
      isDark={isDark}
      toggleTheme={toggleTheme}
      currentLang={selectedLanguage?.code || ''}
      langs={allLanguages}
      setLang={setSelectedLanguage}
      cakePriceUsd={cakePriceUsd}
      profile={profile}
      {...props}
    />
  );
};

export default Menu;
