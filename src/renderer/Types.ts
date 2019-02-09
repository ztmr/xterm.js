/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */

 /**
 * Flags used to render terminal text properly.
 */
export enum FLAGS {
  BOLD = 1,
  UNDERLINE = 2,
  BLINK = 4,
  INVERSE = 8,
  INVISIBLE = 16,
  DIM = 32
};

export enum DECATTRS {
  NOPROTECT = 90000,
  PROTECT   = 90001
};
export enum DECFLAGS {
  PROTECT = 1
};

