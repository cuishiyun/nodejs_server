/*
 Navicat Premium Data Transfer

 Source Server         : test
 Source Server Type    : MySQL
 Source Server Version : 50722
 Source Host           : localhost:3306
 Source Schema         : bycw_center

 Target Server Type    : MySQL
 Target Server Version : 50722
 File Encoding         : 65001

 Date: 28/02/2019 17:11:30
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for phone_chat
-- ----------------------------
DROP TABLE IF EXISTS `phone_chat`;
CREATE TABLE `phone_chat`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phone` varchar(16) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `code` varchar(8) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '' COMMENT '验证码',
  `opt_type` int(11) DEFAULT 0 COMMENT '操作类型,0游客升级,1修改密码,2手机注册拉取验证码',
  `end_time` int(11) DEFAULT NULL COMMENT '验证码结束的时间戳',
  `count` int(11) DEFAULT 0 COMMENT '拉取验证码的次数',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of phone_chat
-- ----------------------------
INSERT INTO `phone_chat` VALUES (3, '18515120919', '9797', 1, 1550052817, 7);
INSERT INTO `phone_chat` VALUES (4, '18515120919', '9238', 2, 1550113122, 2);
INSERT INTO `phone_chat` VALUES (5, '18515120919', '3721', 0, 1550135090, 1);

-- ----------------------------
-- Table structure for uinfo
-- ----------------------------
DROP TABLE IF EXISTS `uinfo`;
CREATE TABLE `uinfo`  (
  `uid` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户唯一id\r\n',
  `unick` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '用户昵称',
  `uname` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '用户名, 全局唯一',
  `upwd` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '用户密码: 32位的md5',
  `usex` int(11) NOT NULL DEFAULT 0 COMMENT '用户性别.0为男，1为女',
  `uface` int(11) NOT NULL DEFAULT 0 COMMENT '用户头像',
  `uphone` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '用户联系方式',
  `uemail` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '用户绑定的邮箱',
  `ucity` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '用户城市',
  `uvip` int(11) NOT NULL DEFAULT 0 COMMENT '用户vip等级',
  `uvip_endtime` int(11) NOT NULL DEFAULT 0 COMMENT 'vip结束的时间戳',
  `guest_key` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '游客账号的key',
  `is_guest` int(11) NOT NULL DEFAULT 0 COMMENT '是否为游客账号',
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '0为有效,1为封号',
  PRIMARY KEY (`uid`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 27 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '存储用户信息的表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of uinfo
-- ----------------------------
INSERT INTO `uinfo` VALUES (18, '12345678', '', '', 1, 0, '', '', '', 0, 0, 'xeCBfzenkZSjAzmQrDDsP8YFzZy4Rjs2', 1, 0);
INSERT INTO `uinfo` VALUES (19, '游客6749', '', '', 1, 0, '', '', '', 0, 0, 'RWT6cSY632nJ3zrxrTAZYzpApQZxhsw2', 1, 0);
INSERT INTO `uinfo` VALUES (20, '游客2178', '', '', 0, 0, '', '', '', 0, 0, 'KKQt8Y4FzdCGMQTKXK7pWBtaTjfcJ2rs', 1, 0);
INSERT INTO `uinfo` VALUES (26, 'elviscui', '18515120919', 'd2fc21f650e8314cc99c86bdae415d28', 0, 0, '', '', '', 0, 0, '', 0, 0);

SET FOREIGN_KEY_CHECKS = 1;
