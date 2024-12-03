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
import {
  Accordion2,
  Box,
  ComponentsProvider,
  Heading,
  IconButton,
} from '@looker/components'
import { Edit, Delete, Download } from '@styled-icons/material'
import React, { useContext, useEffect, useState } from 'react'
import { getTemplates } from '../api'
import { ExtensionContext40 } from '@looker/extension-sdk-react'
import '../customstyles/table.css' // Import the CSS file

const TemplateList = () => {
  const [existingTemplates, setExistingTemplates] = useState<string[]>()
  const [isOpen, setDialogue] = useState<boolean>(false)
  const [confirmText, setConfirmText] = useState<string>('')
  const [index, setIndex] = useState<number>()

  const templates = () => {
    getTemplates().then((response) => {
      setExistingTemplates(response)
    })
  }

  useEffect(() => {
    templates()
  }, [])

  return (
    <ComponentsProvider>
      <Box p="large">
        {existingTemplates?.length ? (
          <div className="header_template">
            <h4 className="list_header">Templates</h4>
            <button
              className="upload_button"
              onClick={() => alert('Upload functionality goes here!')}
            >
              Add Template
            </button>
          </div>
        ) : (
          <></>
        )}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="table-header">S.No</th>
                <th className="table-header">Template Name</th>
                <th className="table-header">Last Modified</th>
                <th className="table-header">For Report</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {existingTemplates?.length ? (
                existingTemplates.map((item, index) => (
                  <tr className="table-row">
                    <td
                      className="table-cell"
                      style={{
                        borderBottom:
                          index == existingTemplates?.length - 1 ? '0' : '',
                      }}
                    >
                      {index + 1}
                    </td>
                    <td
                      className="table-cell"
                      style={{
                        borderBottom:
                          index == existingTemplates?.length - 1 ? '0' : '',
                      }}
                    >
                      {item}
                    </td>
                    <td
                      className="table-cell"
                      style={{
                        borderBottom:
                          index == existingTemplates?.length - 1 ? '0' : '',
                      }}
                    >
                      {'Name'}
                    </td>
                    <td
                      className="table-cell"
                      style={{
                        borderBottom:
                          index == existingTemplates?.length - 1 ? '0' : '',
                      }}
                    >
                      {'Avail'}
                    </td>
                    <td
                      className="table-cell"
                      style={{
                        borderBottom:
                          index == existingTemplates?.length - 1 ? '0' : '',
                      }}
                    >
                      <IconButton
                        style={{ cursor: 'pointer' }}
                        icon={<Edit />}
                        label="Edit"
                        size="small"
                        onClick={() => {
                          setDialogue(true)
                          setConfirmText('Edit')
                          setIndex(index)
                        }}
                      />
                      <IconButton
                        style={{ cursor: 'pointer' }}
                        icon={<Delete />}
                        label="Delete"
                        size="small"
                        onClick={() => {
                          setDialogue(true)
                          setConfirmText('Delete')
                          setIndex(index)
                        }}
                      />
                      <IconButton
                        style={{ cursor: 'pointer' }}
                        icon={<Download />}
                        label="Download"
                        size="small"
                        onClick={() =>
                          alert(`Download clicked for AOS ID: ${index}`)
                        }
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <div className="container">
                  <div className="message">You did not have templates</div>
                  <button
                    className="upload-button"
                    onClick={() => alert('Upload functionality goes here!')}
                  >
                    Add Template
                  </button>
                </div>
              )}
            </tbody>
          </table>
        </div>
      </Box>
    </ComponentsProvider>
  )
}

export default TemplateList
