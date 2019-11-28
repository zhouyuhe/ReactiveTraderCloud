import React, { useCallback, useEffect, useRef, useState } from 'react'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { LaunchButton } from './LaunchButton'
import { LauncherApps } from './LauncherApps'
import { AdaptiveLoader } from 'rt-components'
import { ThemeStorageSwitch } from 'rt-theme'
import { Bounds } from 'openfin/_v2/shapes'
import SearchIcon from './icons/searchIcon'
import {
  ButtonContainer,
  HorizontalContainer,
  IconTitle,
  LauncherGlobalStyle,
  LogoContainer,
  RootContainer,
  ThemeSwitchContainer
} from './styles'
import { animateCurrentWindowSize, closeCurrentWindow, getCurrentWindowBounds } from './windowUtils';
import Measure, { ContentRect } from 'react-measure'
import { SearchControls, SearchState } from './SearchControls';

library.add(faSignOutAlt)

const LauncherExit: React.FC = () => (
  <ButtonContainer key="exit">
    <LaunchButton onClick={closeCurrentWindow}>
      <FontAwesomeIcon icon="sign-out-alt"/>
      <IconTitle>Exit</IconTitle>
    </LaunchButton>
  </ButtonContainer>
)

const SearchButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <ButtonContainer>
    <LaunchButton onClick={onClick}>{SearchIcon}</LaunchButton>
  </ButtonContainer>
)

export const Launcher: React.FC = () => {
  const [initialBounds, setInitialBounds] = useState<Bounds>()
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>()
  const [isSearchBusy, setIsSearchBusy] = useState<boolean>()
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getCurrentWindowBounds().then(setInitialBounds)
  }, [])

  const showSearch = useCallback(
    () => setIsSearchVisible(true),
    []
  );

  // if search is made visible - focus on it
  useEffect(
    () => {
      if (isSearchVisible) {
        searchInputRef.current && searchInputRef.current.focus()
      }
    },
    [isSearchVisible]
  )

  // resize window is search was hidden
  useEffect(() => {
      if (!initialBounds) {
        console.warn(`Cant resize window - 'initialBounds' is not set yet`)
        return
      }
      if (!isSearchVisible) {
        animateCurrentWindowSize(initialBounds)
      }
    },
    [isSearchVisible, initialBounds]
  )

  // hide search if Escape is pressed
  useEffect(
    () => {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsSearchVisible(false)
        }
      }
      document.addEventListener('keydown', onKeyDown)
      return () => document.removeEventListener('keydown', onKeyDown)
    }, []
  )

  const handleSearchStateChange = useCallback(
    (state: SearchState) => setIsSearchBusy(state.typing || state.loading),
    []
  )

  const handleSearchSizeChange = useCallback(
    (contentRect: ContentRect) => {
      if (!initialBounds) {
        return
      }
      animateCurrentWindowSize({
        ...initialBounds,
        height: initialBounds.height + (contentRect.bounds ? contentRect.bounds.height : 0)
      })
    },
    [initialBounds]
  )

  return (
    <RootContainer>
      <LauncherGlobalStyle/>

      <HorizontalContainer>
        <LogoContainer>
          <AdaptiveLoader size={24} speed={isSearchBusy ? 0.8 : 0} seperation={1.5} type="secondary"/>
          {/*<LogoIcon width={1.3} height={1.3}/>*/}
        </LogoContainer>
        <SearchButton onClick={showSearch}/>
        <LauncherApps/>
        <LauncherExit/>
        <ThemeSwitchContainer>
          <ThemeStorageSwitch/>
        </ThemeSwitchContainer>
      </HorizontalContainer>

      {
        isSearchVisible && (
          <Measure
            bounds
            onResize={handleSearchSizeChange}>
            {
              ({ measureRef }) => (
                <SearchControls
                  ref={measureRef}
                  searchInputRef={searchInputRef}
                  onStateChange={handleSearchStateChange}/>
              )
            }
          </Measure>
        )
      }

    </RootContainer>
  )
}
