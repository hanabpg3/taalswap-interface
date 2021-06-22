import React, { useContext, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Pair } from 'taalswap-sdk'
import { Button, CardBody, HelpIcon, Text, useTooltip } from 'taalswap-uikit';
import { Link } from 'react-router-dom'
import Question from 'components/QuestionHelper'
import FullPositionCard from 'components/PositionCard'
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
import { StyledInternalLink } from 'components/Shared'
import { LightCard } from 'components/Card'
import { RowBetween } from 'components/Row'
import { AutoColumn } from 'components/Column'
import Container from 'components/Container'

import { useActiveWeb3React } from 'hooks'
import { usePairs } from 'data/Reserves'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'
import { Dots } from 'components/swap/styleds'
import useI18n from 'hooks/useI18n'
import PageHeader from 'components/PageHeader'
import AppBody from '../AppBody'

const ReferenceElement = styled.div`
  display: flex;
`

export default function Pool() {
  const theme = useContext(ThemeContext)
  const { account } = useActiveWeb3React()
  const TranslateString = useI18n()

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some((V2Pair) => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    TranslateString(
      1170,
      'When you add liquidity, you will receive LP tokens to be registered as your share in this liquidity pool.'
    ),
    { placement: 'top-end', tooltipOffset: [20, 10] },
  )

  return (
    <Container>
      {/* <CardNav activeIndex={1} /> */}
      <AppBody>
        <PageHeader
          title={TranslateString(262, 'Liquidity')}
          description={TranslateString(1168, 'Add liquidity to receive LP tokens')}
        >
          <Button id='join-pool-button' as={Link} to='/add/BNB' mb='16px'>
            {TranslateString(168, 'Add Liquidity')}
          </Button>
        </PageHeader>
        <AutoColumn gap='lg' justify='center'>
          <CardBody>
            <AutoColumn gap='12px' style={{ width: '100%' }}>
              <RowBetween padding='0 8px'>
                <Text color={theme.colors.text}>{TranslateString(107, 'Your Liquidity')}</Text>
                <ReferenceElement ref={targetRef}>
                  <HelpIcon color="textSubtle" />
                </ReferenceElement>
                {tooltipVisible && tooltip}
              </RowBetween>

              {!account ? (
                <LightCard padding='40px'>
                  <Text color='textDisabled' textAlign='center'>
                    {TranslateString(156, 'Connect to a wallet to view your liquidity.')}
                  </Text>
                </LightCard>
              ) : v2IsLoading ? (
                <LightCard padding='40px'>
                  <Text color='textDisabled' textAlign='center'>
                    <Dots>Loading</Dots>
                  </Text>
                </LightCard>
              ) : allV2PairsWithLiquidity?.length > 0 ? (
                <>
                  {allV2PairsWithLiquidity.map((v2Pair) => (
                    <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                  ))}
                </>
              ) : (
                <LightCard padding='40px'>
                  <Text color='textDisabled' textAlign='center'>
                    {TranslateString(104, 'No liquidity found.')}
                  </Text>
                </LightCard>
              )}

              <div>
                <Text fontSize='14px' style={{ padding: '.5rem 0 .5rem 0' }}>
                  {TranslateString(106, 'Don\'t see your pool(s)?')}{' '}
                  <StyledInternalLink id='import-pool-link' to='/find'>
                    {TranslateString(108, 'Import here')}
                  </StyledInternalLink>
                </Text>
                <Text fontSize='14px' style={{ padding: '.5rem 0 .5rem 0' }}>
                  {TranslateString(1172, 'Your LP tokens in a farm can be moved back here by unstaking them.')}
                </Text>
              </div>
            </AutoColumn>
          </CardBody>
        </AutoColumn>
      </AppBody>
    </Container>
  )
}
