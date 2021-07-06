import React, { useContext } from 'react';
import { AlertCircle, CheckCircle } from 'react-feather';
import { Text } from 'taalswap-uikit';
import styled, { ThemeContext } from 'styled-components';
import { useTranslation } from 'contexts/Localization';
import { useActiveWeb3React } from '../../hooks';
import { getBscScanLink } from '../../utils';
import { ExternalLink } from '../Shared';
import { AutoColumn } from '../Column';
import { AutoRow } from '../Row';

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`;

export default function TransactionPopup({
  hash,
  success,
  summary,
}: {
  hash: string;
  success?: boolean;
  summary?: string;
}) {
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        {success ? (
          <CheckCircle color={theme.colors.success} size={24} />
        ) : (
          <AlertCircle color={theme.colors.failure} size={24} />
        )}
      </div>
      <AutoColumn gap="8px">
        <Text>
          {summary ?? `Hash: ${hash.slice(0, 8)}...${hash.slice(58, 65)}`}
        </Text>
        {chainId && (
          <ExternalLink href={getBscScanLink(chainId, hash, 'transaction')}>
            {t('View on EtherScan')}
          </ExternalLink>
        )}
      </AutoColumn>
    </RowNoFlex>
  );
}
