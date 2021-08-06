import { ChainId, Token } from 'taalswap-sdk';
import { Tags, TokenInfo, TokenList } from '@uniswap/token-lists';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../index';
import { useActiveWeb3React } from '../../hooks';

type TagDetails = Tags[keyof Tags]

export interface TagInfo extends TagDetails {
  id: string
}

/**
 * Token instances created from token info.
 */
export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo;

  public readonly tags: TagInfo[];

  constructor(tokenInfo: TokenInfo, tags: TagInfo[]) {
    super(tokenInfo.chainId, tokenInfo.address, tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name);
    this.tokenInfo = tokenInfo;
    this.tags = tags;
  }

  public get logoURI(): string | undefined {
    return this.tokenInfo.logoURI;
  }
}

export type TokenAddressMap = Readonly<{ [chainId in ChainId]: Readonly<{ [tokenAddress: string]: WrappedTokenInfo }> }>

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: TokenAddressMap = {
  [ChainId.MAINNET]: {},
  [ChainId.ROPSTEN]: {},
  [ChainId.RINKEBY]: {},
  [ChainId.KLAYTN]: {},
  [ChainId.BAOBAB]: {}
};

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  typeof WeakMap !== 'undefined' ? new WeakMap<TokenList, TokenAddressMap>() : null;

export function listToTokenMap(list: TokenList): TokenAddressMap {
  const result = listCache?.get(list);
  if (result) return result;

  const map = list.tokens.reduce<TokenAddressMap>(
    (tokenMap, tokenInfo) => {
      const tags: TagInfo[] =
        tokenInfo.tags
          ?.map(tagId => {
            if (!list.tags?.[tagId]) return undefined;
            return { ...list.tags[tagId], id: tagId };
          })
          ?.filter((x): x is TagInfo => Boolean(x)) ?? [];
      const token = new WrappedTokenInfo(tokenInfo, tags);
      if (tokenMap[token.chainId][token.address] !== undefined) throw Error('Duplicate tokens.');
      return {
        ...tokenMap,
        [token.chainId]: {
          ...tokenMap[token.chainId],
          [token.address]: token
        }
      };
    },
    { ...EMPTY_LIST }
  );
  listCache?.set(list, map);
  return map;
}

export function useTokenList(url: string | undefined): TokenAddressMap {
  const { chainId } = useActiveWeb3React()
  const lists = useSelector<AppState, AppState['lists']['chain']['byUrl']>(state => state.lists[chainId ?? '1'].byUrl);
  return useMemo(() => {
    if (!url) return EMPTY_LIST;
    const current = lists[url]?.current;
    if (!current) return EMPTY_LIST;
    try {
      return listToTokenMap(current);
    } catch (error) {
      console.error('Could not show token list due to error', error);
      return EMPTY_LIST;
    }
  }, [lists, url]);
}

export function useSelectedListUrl(): string | undefined {
  const { chainId } = useActiveWeb3React()
  return useSelector<AppState, AppState['lists']['chain']['selectedListUrl']>(state => state.lists[chainId ?? '1'].selectedListUrl);
}

export function useSelectedTokenList(): TokenAddressMap {
  return useTokenList(useSelectedListUrl());
}

export function useSelectedListInfo(): { current: TokenList | null; pending: TokenList | null; loading: boolean } {
  const selectedUrl = useSelectedListUrl();
  const { chainId } = useActiveWeb3React()
  const listsByUrl = useSelector<AppState, AppState['lists']['chain']['byUrl']>(state => state.lists[chainId ?? '1'].byUrl);
  const list = selectedUrl ? listsByUrl[selectedUrl] : undefined;
  return {
    current: list?.current ?? null,
    pending: list?.pendingUpdate ?? null,
    loading: list?.loadingRequestId !== null
  };
}

// returns all downloaded current lists
export function useAllLists(): TokenList[] {
  const { chainId } = useActiveWeb3React()
  const lists = useSelector<AppState, AppState['lists']['chain']['byUrl']>(state => state.lists[chainId ?? '1'].byUrl);

  return useMemo(
    () =>
      Object.keys(lists)
        .map(url => lists[url].current)
        .filter((l): l is TokenList => Boolean(l)),
    [lists]
  );
}
