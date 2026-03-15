export const TRAIN_TYPE = {
  KTX: "KTX",
  KTX_SANCHEON: "KTX-산천",
  ITX_SAEMAUL: "ITX-새마을",
  ITX_CHEONGCHUN: "ITX-청춘",
  MUGUNGHWA: "무궁화호",
} as const;

export type TrainType = (typeof TRAIN_TYPE)[keyof typeof TRAIN_TYPE];
