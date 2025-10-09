import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { setLanguage } from '@/store/i18nSlice'
import { i18n } from '@/lib/i18n'

export const LangSwitcher: React.FC = () => {
  const dispatch = useDispatch()
  const lang = useSelector((s: RootState) => s.i18n.language)

  const change = (l: string) => {
    dispatch(setLanguage(l))
    i18n.changeLanguage(l)
  }

  return <div className="flex items-center gap-2">
    <label className="mr-2">语言：</label>
    <select value={lang} onChange={(e) => change(e.target.value)}>
      <option value="en">English</option>
      <option value="zh">中文</option>
    </select>
  </div>
}

export default LangSwitcher
