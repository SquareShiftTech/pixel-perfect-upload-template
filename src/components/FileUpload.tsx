/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */
import React, { useContext, useEffect, useRef, useState } from 'react'
import type { InputFileProps } from '@looker/components'
import {
  Button,
  CardContent,
  ComponentsProvider,
  Heading,
  InputFile,
  ProgressCircular,
  Space,
} from '@looker/components'
import { getTemplates, uploadFile } from '../api'
import TemplateList from './TemplateList'
import '../customstyles/upload.css'
import Dropdown from './dropdown'
import { ExtensionContext40 } from '@looker/extension-sdk-react'
import { IFolder } from '@looker/sdk'

const Loading = () => {
  return (
    <Space justify="center" height={'50vh'}>
      <ProgressCircular />
      Loading...
    </Space>
  )
}

export const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [showFileName, setShowFileName] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [templateForm, setTemplateForm] = useState({ dashboard: '', name: '' })
  const fileInputRef: any = useRef(null)
  const { coreSDK } = useContext(ExtensionContext40)
  const [folderList, setFolderList] = useState<IFolder[]>()
  const handleSubmit = () => {
    if (file) {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      uploadFile(formData).then(
        (response) => {
          setShowFileName(false)
        },
        (error) => {
          // eslint-disable-next-line no-console
          console.log(error)
        }
      )
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setTemplateForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const extractFileName = (file: File): [string, string] => {
    const { name } = file
    const separatedValues = name.split('.')
    return [
      separatedValues[separatedValues.length - 2],
      separatedValues[separatedValues.length - 1],
    ]
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      console.log('Selected file:', files[0])
      setFileName(files[0].name) // Log the selected file
    }
  }

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click() // Trigger the click on the file input
    }
  }

  const handleSelect = (option: IFolder) => {
    console.log('Selected option:', option)
  }

  const getFolders = async () => {
    let singleFolder = await coreSDK.ok(
      coreSDK.folder_children({ folder_id: '57' })
    )
    setIsLoading(false)
    setFolderList(singleFolder)
    console.log('singleFolder', singleFolder)
  }

  useEffect(() => {
    setIsLoading(true)
    getFolders()
  }, [])

  return (
    <ComponentsProvider
      themeCustomizations={{
        colors: { key: '#1A73E8' },
      }}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <div>
          <TemplateList />
          <div className="container">
            <h4>Add Template</h4>
            <div className="container_inputs">
              <div className="container_div">
                <label className="input_label">Template Name:</label>
                <br />
                <input
                  className="inputs"
                  type="text"
                  name="template"
                  value={templateForm.name}
                  onChange={handleChange}
                />
              </div>
              <div className="container_div">
                <label className="input_label">Select Dashboard:</label>
                <br />
                <Dropdown
                  options={folderList}
                  onSelect={handleSelect}
                />
              </div>
            </div>
            <div className="but_div">
              <input
                type="file"
                accept=".xlsx"
                multiple={false}
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div className="upload-div">
                <button className="upload-button" onClick={handleClick}>
                  Click here to upload
                </button>
                {fileName ? <span>{fileName}</span> : <></>}
              </div>
              <div>
                <button
                  disabled={!templateForm.name || !templateForm.dashboard}
                  className="upload-save"
                  onClick={() => alert('Upload functionality goes here!')}
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ComponentsProvider>
  )
}
