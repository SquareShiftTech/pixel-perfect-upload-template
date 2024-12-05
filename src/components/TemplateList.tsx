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
  Accordion,
  Accordion2,
  AccordionContent,
  AccordionDisclosure,
  Box,
  Button,
  ComponentsProvider,
  Dialog,
  Heading,
  IconButton,
  MenuItem,
  Select
} from '@looker/components'
import { Edit, Delete, Download } from '@styled-icons/material'
import React, { useContext, useEffect, useState, useRef } from 'react'
import { getTemplates } from '../api'
import '../customstyles/table.css' // Import the CSS file
import { FormControl, Paper, Step, StepContent, StepLabel, Typography, InputLabel } from '@mui/material'
import { Stepper } from '@mui/material'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

const steps = [
  {
    label: 'Choose Dashboard',
  },
  {
    label: 'Template Upload',
  },
  {
    label: 'Template Name',
  },
];

const folderStructure = [
  {
    id: 'folder1',
    name: 'Sales Folders',
    children: [
      {
        id: 'subfolder1',
        name: 'North Region',
        dashboards: [
          { id: 1, name: 'Sales Dashboard' },
          { id: 2, name: 'Revenue Dashboard' },
        ]
      },
      {
        id: 'subfolder2',
        name: 'South Region',
        dashboards: [
          { id: 3, name: 'Performance Dashboard' },
        ]
      }
    ]
  },
  {
    id: 'folder2',
    name: 'Marketing Folders',
    children: [
      {
        id: 'subfolder3',
        name: 'Campaign Analytics',
        dashboards: [
          { id: 4, name: 'Campaign Dashboard' },
          { id: 5, name: 'Marketing ROI Dashboard' },
        ]
      }
    ]
  }
];


const TemplateList = () => {
  const [existingTemplates, setExistingTemplates] = useState<string[]>()
  const [isOpen, setDialogue] = useState<boolean>(false)
  const [confirmText, setConfirmText] = useState<string>('')
  const [index, setIndex] = useState<number>()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [activeStep, setActiveStep] = React.useState(0);
  const [selectedDashboard, setSelectedDashboard] = useState<string>('')
  const [templateName, setTemplateName] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedSubFolder, setSelectedSubFolder] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [selectedFolderContent, setSelectedFolderContent] = useState<any>(null);
  const [fileName, setFileName] = useState<string>('')
  const [selectedSubfolderDashboards, setSelectedSubfolderDashboards] = useState<any>(null);
  const [selectedDashboardId, setSelectedDashboardId] = useState<number | null>(null);
  const [isMoveToTenantOpen, setIsMoveToTenantOpen] = useState<boolean>(false)
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(null)
  const [movedTemplates, setMovedTemplates] = useState<Set<number>>(new Set());
  const [selectedRole, setSelectedRole] = useState<string>('')
  const roles = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
    { value: 'tenant', label: 'Tenant' }
  ]

  const fileInputRef: any = useRef(null)
  const dashboards = [
    { id: 1, name: 'Sales Dashboard' },
    { id: 2, name: 'Marketing Dashboard' },
    { id: 3, name: 'Analytics Dashboard' },
  ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      toast.success('Submitted successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          background: 'white',
          color: '#4caf50',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          fontSize: '14px'
        }
      });
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  // ... existing 

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click() // Trigger the click on the file input
    }
  }

  const handleFolderClick = (folder: any) => {
    setExpandedFolders(prev =>
      prev.includes(folder.id)
        ? prev.filter(id => id !== folder.id)
        : [...prev, folder.id]
    );
    setSelectedFolderContent(folder.children || []);
    setSelectedSubfolderDashboards(null); // Reset dashboards when selecting new folder
    setSelectedDashboardId(null); // Reset selected dashboard
  };

  // Add new handler for subfolder clicks
  const handleSubfolderClick = (subfolder: any) => {
    setSelectedSubfolderDashboards(subfolder.dashboards || []);
    setSelectedDashboardId(null); // Reset selected dashboard
  };

  // Add new handler for dashboard selection
  const handleDashboardSelect = (dashboard: any) => {
    setSelectedDashboardId(dashboard.id);
    setSelectedDashboard(dashboard.name); // Update the existing selectedDashboard state
  };

  const handleMoveToTenant = (index: number) => {
    setSelectedTemplateIndex(index)
    setIsMoveToTenantOpen(true)
  }

  const handleMoveTemplate = () => {
    if (selectedTemplateIndex !== null) {
      setMovedTemplates(prev => new Set(prev).add(selectedTemplateIndex));

      toast.success('Template moved to tenant successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          background: 'white',
          color: '#4caf50',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          fontSize: '14px'
        }
      });

      setIsMoveToTenantOpen(false);
    }
  };

  const templates = () => {
    getTemplates().then((response) => {
      setExistingTemplates(response)
    })
  }

  useEffect(() => {
    templates()
  }, [])

  console.log({ selectedRole })

  return (
    <ComponentsProvider>
      <Box mt="medium">
        <div className="select-container">
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="select-role"
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
      </Box>
      <ToastContainer />
      <Box p="large">
        {existingTemplates?.length ? (
          <div className="header_template">
            <h4 className="list_header">Templates</h4>
            {selectedRole === "admin" ?
              <button
                className="upload_button"
                onClick={() => setIsModalOpen(true)}
                style={{ cursor: "pointer" }}
              >
                Add Template
              </button>
              : null}
          </div>
        ) : (
          <></>
        )}
        <div className="table-container">
          {/* {existingTemplates?.length && (
                <div className="container">
                  <div className="message">You did not have templates</div>
                  <button
                    className="upload-button"
                    onClick={() => alert('Upload functionality goes here!')}
                  >
                    Add Template
                  </button>
                </div>
              )} */}
          <table className="data-table">
            <thead>
              <tr>
                <th className="table-header">S.No</th>
                <th className="table-header">Template Name</th>
                <th className="table-header">Last Modified</th>
                <th className="table-header">Report Name</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {existingTemplates?.length ? (
                existingTemplates.map((item, index) => (
                  <tr key={index} className="table-row">
                    <td
                      className="table-cell"
                      style={{
                        borderBottom:
                          index === existingTemplates?.length - 1 ? '0' : '',
                      }}
                    >
                      {index + 1}
                    </td>
                    <td
                      className="table-cell"
                      style={{
                        borderBottom:
                          index === existingTemplates?.length - 1 ? '0' : '',
                      }}
                    >
                      {item}
                    </td>
                    <td
                      className="table-cell"
                      style={{
                        borderBottom:
                          index === existingTemplates?.length - 1 ? '0' : '',
                      }}
                    >
                      {'Name'}
                    </td>
                    <td
                      className="table-cell"
                      style={{
                        borderBottom:
                          index === existingTemplates?.length - 1 ? '0' : '',
                      }}
                    >
                      {'Avail'}
                    </td>
                    <td
                      className="table-cell"
                      style={{
                        borderBottom:
                          index === existingTemplates?.length - 1 ? '0' : '',
                      }}
                    >
                      {selectedRole === "admin" ? (
                        <>
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
                      /> </>) : null}
                      <IconButton
                        style={{ cursor: 'pointer' }}
                        icon={<Download />}
                        label="Download"
                        size="small"
                        onClick={() =>
                          alert(`Download clicked for AOS ID: ${index}`)
                        }
                      />
                      {selectedRole === "admin" ?
                        <button className='upload_button' style={{ padding: "6px", cursor: "pointer" }} onClick={() => handleMoveToTenant(index)}
                          disabled={movedTemplates.has(index)}>
                          {movedTemplates.has(index) ? 'Moved' : 'Move to tenant'}
                        </button>
                        : null}
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
          <Dialog
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}

            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"

          >
            <Box sx={{ maxWidth: 400 }}>
              {/* <Typography id="dialog-title" variant="h6" component="h2">
                Add New Template
              </Typography> */}
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      optional={
                        index === steps.length - 1 ? (
                          <Typography variant="caption">Last step</Typography>
                        ) : null
                      }
                    >
                      {step.label}
                    </StepLabel>
                    <StepContent>
                      {/* <Typography id="dialog-description">{step.description}</Typography> */}
                      {index === 0 && (
                        <>
                          <div className='dashboard-container'>
                            <div className='right-content'>
                              {folderStructure.map((folder) => (
                                <div
                                  key={folder.id}
                                  onClick={() => handleFolderClick(folder)}
                                  className={`folder-item ${expandedFolders.includes(folder.id) ? 'selected' : ''}`}
                                >
                                  {folder.name}
                                </div>
                              ))}
                            </div>
                            <div className='middle-content'>
                              {selectedFolderContent && selectedFolderContent.map((subfolder: any) => (
                                <div
                                  key={subfolder.id}
                                  onClick={() => handleSubfolderClick(subfolder)}
                                  className={`subfolder-item ${selectedSubfolderDashboards === subfolder.dashboards ? 'selected' : ''}`}
                                >
                                  {subfolder.name}
                                </div>
                              ))}
                            </div>
                            <div className='right-content'>
                              {selectedSubfolderDashboards && selectedSubfolderDashboards.map((dashboard: any) => (
                                <div
                                  key={dashboard.id}
                                  onClick={() => handleDashboardSelect(dashboard)}
                                  className={`dashboard-item ${selectedDashboardId === dashboard.id ? 'selected' : ''}`}
                                >
                                  {dashboard.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                      {index === 1 && (
                        <div className="upload-div">
                          <button className="upload-button" onClick={handleClick}>
                            Upload
                          </button>
                          {fileName ? <span>{fileName}</span> : <></>}
                        </div>
                      )}
                      {index === 2 && (
                        <div style={{ marginTop: '16px' }}>
                          <input
                            type="text"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="Enter template name"
                            style={{
                              width: '100%',
                              padding: '8px',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              fontSize: '14px', marginBottom: "16px",
                              marginTop: "-11px"
                            }}
                          />
                        </div>
                      )}
                      <div className="button-container" style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={handleNext}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "20px",
                            border: "none",
                            background: "#5da1e4",
                            fontSize: "14px",
                            color: "white",
                            boxShadow: "0px 0px 3px #aaa",
                            cursor: "pointer"
                          }}
                        >
                          {index === steps.length - 1 ? 'Submit' : 'Continue'}
                        </button>
                        <button
                          disabled={index === 0}
                          onClick={handleBack}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "200px",
                            border: "none",
                            background: "#5da1e4",
                            boxShadow: "0px 0px 3px #aaa",
                            fontSize: "14px",
                            cursor: "pointer"
                          }}
                        >
                          Back
                        </button>
                      </div>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
              {activeStep === steps.length && (
                <Paper square elevation={0} sx={{ p: 3 }}>
                  <Typography>All steps completed - you're finished</Typography>
                  {/* <button onClick={handleReset} style={{
                    padding: "6px 20px",
                    marginTop: "8px",
                    borderRadius: "20px",
                    border: "none",
                    background: "rgb(93, 161, 228)",
                    boxShadow: "0px 0px 3px #aaa",
                    color: "white",
                    cursor: "pointer"
                  }}>
                    Reset
                  </button> */}
                  <button onClick={() => setIsModalOpen(false)} style={{
                    padding: "6px 20px",
                    marginTop: "8px",
                    borderRadius: "20px",
                    border: "none",
                    background: "#ea7171",
                    boxShadow: "rgb(170, 170, 170) 0px 0px 3px",
                    color: "white",
                    marginLeft: "8px",
                    cursor: "pointer"
                  }}>
                    Close
                  </button>
                </Paper>
              )}
            </Box>
          </Dialog>
          <Dialog
            isOpen={isMoveToTenantOpen}
            onClose={() => setIsMoveToTenantOpen(false)}
            aria-labelledby="move-tenant-dialog-title"
          >
            <Box p="large">
              <Heading id="move-tenant-dialog-title">Move Template to Tenant</Heading>
              <Box mt="medium">
                Are you sure you want to move template "{selectedTemplateIndex !== null ? existingTemplates?.[selectedTemplateIndex] : ''}" to another tenant?
              </Box>
              <div className="button-container" style={{
                marginTop: "20px",
                display: "flex",
                gap: "10px"
              }}>
                <button onClick={() => setIsMoveToTenantOpen(false)} className='upload-button'>
                  Cancel
                </button>
                <button
                  onClick={handleMoveTemplate}
                  className='upload_button move'
                >
                  Move
                </button>
              </div>
            </Box>
          </Dialog>
        </div>
      </Box>
    </ComponentsProvider>
  )
}

export default TemplateList
