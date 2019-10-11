/*--------------------------------------------------------------------------
　装備可能な武器を増やすスキル ver 1.0

■作成者
キュウブ

■概要
装備可能な武器が増えます。
ただし、クラスタイプに対応していない武器カテゴリを持たせる事はできません。
（斧しか扱えない戦士系クラスに戦士系武器の剣や槍を装備させる事はできても、弓兵系武器の弓や魔道士系武器の魔法を装備させる事はできないという事）

■使い方
1."addWeaponType"というキーワードのカスタムスキルを作る
2.スキルに以下のカスパラ設定をする
{
	weaponCategoryTypeIndex: <武器カテゴリが戦士系の場合は0,弓兵系の場合は1,魔道士系の場合は2>,
	weaponTypeID: <武器のID>
}


例.斧を装備可能なスキルを作る場合
{
	weaponCategoryTypeIndex:0,
	weaponTypeID: 2
}

■更新履歴
ver 1.0 (2019/10/12)
初版作成

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったら修正できる方はご自身で修正版を配布してもらっても構いません)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function(){
	ItemControl.isWeaponAvailable = function(unit, item) {
		if (item === null) {
			return false;
		}
		
		// itemが武器でない場合は装備できない
		if (!item.isWeapon()) {
			return false;
		}
		
		// 「熟練度」を調べる
		if (!this._isWeaponLevel(unit, item)) {
			return false;
		}
		
		// 「戦士系」などが一致するか調べる
		if (!this._compareTemplateAndCategory(unit, item)) {
			return false;
		}
		
		// クラスの「装備可能武器」のリストに入っているか調べる
		if (!this.isWeaponTypeAllowed(unit.getClass().getEquipmentWeaponTypeReferenceList(), item, unit)) {
			return false;
		}
		
		// 「専用データ」を調べる
		if (!this.isOnlyData(unit, item)) {
			return false;
		}
		
		if (item.getWeaponCategoryType() === WeaponCategoryType.MAGIC) {
			// 「魔法攻撃」が禁止されているか調べる
			if (StateControl.isBadStateFlag(unit, BadStateFlag.MAGIC)) {
				return false;
			}
		}
		else {
			// 「物理攻撃」が禁止されているか調べる
			if (StateControl.isBadStateFlag(unit, BadStateFlag.PHYSICS)) {
				return false;
			}
		}
		
		return true;
	};

	var alias1 = ItemControl.isWeaponTypeAllowed;
	ItemControl.isWeaponTypeAllowed = function(refList, weapon, unit) {
		var i, skillArray, count, weaponTypeList;
		var isWeaponTypeAllowed = alias1.call(this, refList, weapon);

		if (isWeaponTypeAllowed === true || !unit) {
			return isWeaponTypeAllowed;
		}

		skillArray = SkillControl.getSkillMixArray(unit, weapon, SkillType.CUSTOM, 'addWeaponType');
		count = skillArray.length;
		
		for (i = 0; i < count; i++) {

			if (typeof skillArray[i].skill.custom.weaponTypeID !== 'number' || typeof skillArray[i].skill.custom.weaponCategoryTypeIndex !== 'number') {
				continue;
			}

			weaponTypeList = root.getBaseData().getWeaponTypeList(skillArray[i].skill.custom.weaponCategoryTypeIndex);

			if (weapon.isWeaponTypeMatched(weaponTypeList.getDataFromId(skillArray[i].skill.custom.weaponTypeID))) {
				break;
			}
		}
		
		if (i === count) {
			return false;
		}
		
		return true;
	};
})();