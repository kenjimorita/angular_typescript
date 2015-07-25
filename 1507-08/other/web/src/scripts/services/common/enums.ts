/// <reference path="../../vendor_def/tsd.d.ts" />

module sb {
  'use strict';

  export interface EnumDef {
    name: string
    code: string
  }
  export interface Enums {
    userStatus: {
      ENA: string
      DIS: string
      REG: string
    }
    userRole: {
      ADM: EnumDef
      REC: EnumDef
      INT: EnumDef
    }
    jobStatus: {
      PUB: EnumDef
      RDY: EnumDef
      ARC: EnumDef
    }
    applicationSource: {
      DRC: EnumDef
      MNL: EnumDef
      JSE: EnumDef
    }
    indexingStatus: {
      NVR: EnumDef
      PUB: EnumDef
      RJC: EnumDef
    }
    jobType: any
    salaryUnit: any[]
    salaryUnitEnum: {
      Hourly: EnumDef
      Daily: EnumDef
      Monthly: EnumDef
      Yearly: EnumDef
      Negotiable: EnumDef
      NotOpen: EnumDef
    }
    selectionStageOptions: any[]
    imageFileType: string[]
    resumeFileType: string[]
    timelineType: {
      stage: string
      note: string
      interview: string
      message: string
      feedback: string
      docscreening: string
    }
    feedbackOptions: any[]
    jobApplicableStatus: {
      OPN: EnumDef
      CLS: EnumDef
      OTH: EnumDef
    }
    interviewType: any;
    interviewFeedbackGrade: any[]
  }

  export class StaticConfig {
    images = {
      maxFileSize: 5 * 1024 * 1024,

      logo: {
        minWidth: 50,
        minHeight: 50
      },

      cover: {
        minWidth: 500,
        minHeight: 200
      },

      inline: {
        minWidth: 300,
        minHeight: 200
      }
    }

    applications = {
      attachments: {
        maxFileSize: 5 * 1024 * 1024
      }
    }

    terms = {
      max: 30,
      termsLength: 50,
      descLength: 200
    }
    
    locations = {
      max: 10
    }
  }
}

module stanby.services.common.enums {
  export function initEnums(){

    angular.module('stanbyServices')
      .constant('stStaticConfig', new sb.StaticConfig())
      .constant('enums', {
        // ユーザーステータス
        userStatus: {
          "ENA": "有効",
          "DIS": "無効",
          "REG": "登録中"
        },
        // ユーザーロール
        userRole: {
          ADM: {name: "管理者", code: "ADM", desc: "管理者は、アカウント管理や企業アカウントの編集ができます" },
          REC: {name: "人事担当者", code: "REC", desc: "人事担当者は、求人の編集・掲載や応募者の選考管理ができます" },
          INT: {name: "面接官", code: "INT", desc: "面接官は、面接評価や書類選考をおこなうことができます" }
        },
        // 企業公開ステータス
        corporateStatus: {
          "OPN":"公開",
          "CNS":"審査中",
          "PRV":"非公開",
          "RJC":"拒否"
        },
        applicationSource: {
          DRC: {code: 'DRC', name: '直接応募'},
          MNL: {code: 'MNL', name: '手動追加'},
          JSE: {code: 'JSE', name: 'スタンバイ経由'}
        },
        // 求人公開ステータス
        jobStatus: {
          PUB: {name: "作成済", code: "PUB"},
          RDY: {name: "下書き", code: "RDY"},
          ARC: {name: "削除", code: "ARC"}
        },
        // 応募状況
        jobApplicableStatus: {
          OPN: {name: "募集中", code: "OPN"},
          CLS: {name: "終了", code: "CLS"},
          OTH: {name: "-", code: "OTH"}
        },
        // JSE 掲載ステータス
        indexingStatus: {
          NVR: {name: "まもなく検索可能になります", code: "NVR", label:"スタンバイ掲載準備中"},
          PUB: {name: "検索可能になりました", code: "PUB", label:"スタンバイ掲載中"},
          RJC: {name: "掲載見合わせ", code: "RJC", label:"スタンバイ掲載見合わせ"}
        },
        // 雇用形態
        jobType: {
          "FULL": { name:"正社員", jobClass:"FULL" },
          "CONT": { name:"契約社員", jobClass:"FULL" },
          "NWGR": { name:"新卒", jobClass:"FULL" },
          "INTN": { name:"インターン", jobClass:"PART" },
          "PART": { name:"アルバイト・パート", jobClass:"PART" },
          "TEMP": { name:"派遣社員", jobClass:"FULL" },
          "OTSR": { name:"業務委託", jobClass:"FULL" }
        },
        // 雇用形態 radio inputフォーム用（arrayでないと、orderByが使えないのでやむをえず追加）
        jobTypeRadio: [
          { code: "FULL", name:"正社員", jobClass:"FULL", sortNo: 0},
          { code: "CONT", name:"契約社員", jobClass:"FULL", sortNo: 1},
          { code: "NWGR", name:"新卒", jobClass:"FULL", sortNo: 2},
          { code: "OTSR", name:"業務委託", jobClass:"FULL", sortNo: 3},
          { code: "INTN", name:"インターン", jobClass:"PART", sortNo: 4},
          { code: "PART", name:"アルバイト・パート", jobClass:"PART", sortNo: 5}
        ],
        // 給与区分
        salaryUnit: [
          {code: "HOR", name: "時給", sortNo: 0},
          {code: "DAY", name: "日給", sortNo: 1},
          {code: "MNT", name: "月給", sortNo: 2},
          {code: "YAR", name: "年収", sortNo: 3},
          {code: "NEG", name: "応相談", sortNo: 4},
          {code: "NOP", name: "非公開", sortNo: 5}
        ],
        salaryUnitEnum: {
          Hourly:     {code: "HOR", name: "時給", sortNo: 0},
          Daily:      {code: "DAY", name: "日給", sortNo: 1},
          Monthly:    {code: "MNT", name: "月給", sortNo: 2},
          Yearly:     {code: "YAR", name: "年収", sortNo: 3},
          Negotiable: {code: "NEG", name: "応相談", sortNo: 4},
          NotOpen:    {code: "NOP", name: "非公開", sortNo: 5}
        },
        salaryType: {
          "HOR": {code: "HOR", name: "時給", sortNo: 0},
          "DAY": {code: "DAY", name: "日給", sortNo: 1},
          "MNT": {code: "MNT", name: "月給", sortNo: 2},
          "YAR": {code: "YAR", name: "年収", sortNo: 3}
        },
        // 学歴ステータス
        educationStatus: {
          "ENR" : "在籍",
          "GRD" : "卒業",
          "DRP" : "中退"
        },
        // 選考ステータス
        selectionStage: {
          "NOA": "未対応",
          "SCR": "書類審査",
          "PRG": "選考中",
          "OFR": "内定",
          "RJC": "不合格",
          "DEC": "辞退"
        },
        // 選考ステータス NOTE(tanacasino): ng-options用 sortNoがオブジェクトだと制御できないためやむを得ず追加
        selectionStageOptions: [
          { code: "NOA", name: "未対応", sortNo: 0 },
          { code: "SCR", name: "書類審査", sortNo: 1 },
          { code: "PRG", name: "選考中", sortNo: 2 },
          { code: "OFR", name: "内定",   sortNo: 3 },
          { code: "RJC", name: "不合格", sortNo: 4 },
          { code: "DEC", name: "辞退",   sortNo: 5 }
        ],
        interviewFeedbackGrade: [
          { code: 'S', value: 5, shortName: '合格S', name: '合格S - 絶対採用したい'},
          { code: 'A', value: 4, shortName: '合格A', name: '合格A - 採用したい'},
          { code: 'B', value: 3, shortName: '合格B', name: '合格B - 判断に迷う/ギリギリ'},
          { code: 'F', value: 2, shortName: '不合格', name: '不合格'},
          { code: 'H', value: 1, shortName: '保留', name: '保留'}
        ],
        // 画像ファイル拡張子
        imageFileType: [
          "gif",
          "jpg",
          "png"
        ],
        // レジュメファイル拡張子
        resumeTileType: [
          "pdf",
          "doc",
          "docx",
          "xls",
          "xlsx"
        ],
        //タイムラインの種類
        timelineType: {
          'stage': 'stage',
          'note': 'note',
          'interview': 'interview',
          'message': 'message',
          'feedback': 'feedback',
          'docscreening' : 'docscreening'
        },
        feedbackOptions: [
          { code: 'Y', name: '済', sortNo: 0},
          { code: 'N', name: '未', sortNo: 1}
        ],
        // 面接/書類審査（Interviewに入るデータの種類）
        interviewType: {
          INT : {code: "INT", name: "面接"},
          DOC : {code: "DOC", name: "書類審査"}
        }
      })
    ;
  }
}
