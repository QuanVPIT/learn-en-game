import { createContext, useContext } from 'react';
import { PLAYERS, type Player } from '../data';

/** Bé đang chơi */
export const PlayerContext = createContext<Player>(PLAYERS[0]);
export const usePlayer = () => useContext(PlayerContext);
