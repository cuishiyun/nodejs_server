/*
 Navicat Premium Data Transfer

 Source Server         : test
 Source Server Type    : MySQL
 Source Server Version : 50722
 Source Host           : localhost:3306
 Source Schema         : bycw_game_node

 Target Server Type    : MySQL
 Target Server Version : 50722
 File Encoding         : 65001

 Date: 28/02/2019 17:11:38
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for login_bonues
-- ----------------------------
DROP TABLE IF EXISTS `login_bonues`;
CREATE TABLE `login_bonues`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) DEFAULT NULL COMMENT '用户id',
  `bonues` int(11) DEFAULT NULL COMMENT '奖励的多少',
  `status` int(11) DEFAULT NULL COMMENT '0表示未领取，1表示已领取',
  `bonues_time` int(11) DEFAULT NULL COMMENT '上一次发放登陆奖励的时间',
  `days` int(11) DEFAULT NULL COMMENT '连续登陆的天数',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '每日登陆奖励' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of login_bonues
-- ----------------------------
INSERT INTO `login_bonues` VALUES (5, 18, 300, 1, 1551235454, 3);
INSERT INTO `login_bonues` VALUES (6, 26, 300, 1, 1551252986, 3);

-- ----------------------------
-- Table structure for ugame
-- ----------------------------
DROP TABLE IF EXISTS `ugame`;
CREATE TABLE `ugame`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ugame表的唯一id',
  `uid` int(11) DEFAULT NULL COMMENT '用户uid',
  `uexp` int(11) DEFAULT NULL COMMENT '用户经验值',
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '0为正常,1为非法的数据记录',
  `uchip` int(11) DEFAULT NULL COMMENT '金币',
  `udata` int(11) NOT NULL DEFAULT 0 COMMENT '游戏的一些统计数据',
  `uvip` int(11) NOT NULL DEFAULT 0 COMMENT '游戏vip',
  `uvip_endtime` int(11) NOT NULL DEFAULT 0 COMMENT '游戏vip结束时间戳',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '存放玩家的游戏信息' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ugame
-- ----------------------------
INSERT INTO `ugame` VALUES (3, 18, 1500, 0, 3182, 0, 0, 0);
INSERT INTO `ugame` VALUES (4, 26, 1000, 0, 2018, 0, 0, 0);

SET FOREIGN_KEY_CHECKS = 1;
