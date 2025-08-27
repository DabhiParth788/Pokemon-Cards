// ** React Imports
import { forwardRef, Fragment } from "react";

// ** Third party
import { useTheme } from "@emotion/react";
import { Icon } from "@iconify/react";

// ** MUI Imports
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { Box } from "@mui/system";
import { Typography, useMediaQuery } from "@mui/material";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CommonModal = ({
  handleClose,
  cancelText = "",
  open,
  title,
  newTitle = "",
  subTitle,
  content,
  size,
  customSize,
  tabs,
  stopCloseOnOutSideClick = false,
  titlePosition = "center",
  manageNewUi = false,
  maxWidth = "100%",
  hideScroll = false,
  isBluryModel = false,
  isNewHeader = false,
  newBodyCss = {},
  newOnBoarningPaperCss = {},
  bluryExtraModelCSS = {},
  sx = {},
}) => {
  const theme = useTheme();
  let first = "white";
  let second = "#dbc5c5de";
  let third = "black";
  const newPaperCss = {
    ...bluryExtraModelCSS,
    background: `${first} !important`,
    "& .MuiDialogTitle-root": {
      background: `${first} !important`,
      backdropFilter: "blur(40px)",
    },
    "& .MuiDialogContent-root": {
      background: "transparent",
      padding: bluryExtraModelCSS?.padding || "24px !important",
      backdropFilter: "blur(40px)",
    },
  };

  const newCss = {
    // border: `1px solid ${second} !important`,
    maxWidth: maxWidth,
    ...newOnBoarningPaperCss,
    "& .MuiDialogContent-root": {
      ...newBodyCss,
    },
    ...(isBluryModel ? newPaperCss : {}),
  };
  const customCss = {
    maxWidth: customSize,
    width: "100%",
    ...newOnBoarningPaperCss,
    "& .MuiDialogContent-root": {
      ...newBodyCss,
    },
  };

  return (
    <Fragment>
      <Dialog
        open={open}
        keepMounted
        onClose={(_, reason) => {
          if (
            !(
              stopCloseOnOutSideClick &&
              (reason === "backdropClick" || reason === "escapeKeyDown")
            )
          ) {
            handleClose();
          }
        }}
        sx={sx}
        TransitionComponent={Transition}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
        maxWidth={size !== "custom" ? size : ""}
        // fullWidth={size !== 'custom' ? size : ''}
        fullWidth={size !== "custom"}
        PaperProps={{
          sx: manageNewUi ? newCss : size === "custom" ? customCss : {},
        }}
      >
        <Box
          position="relative"
          sx={{
            ...(title && {
              borderBottom: `1px solid ${second}`,
            }),
          }}
        >
          {title && (
            <DialogTitle
              id="alert-dialog-slide-title"
              sx={{
                textAlign: titlePosition,
                padding: "12px 16px",
                fontSize: isNewHeader ? "18px" : "20px",
                fontWeight: "700",
                lineHeight: "24px",
                color: third,
                ...(isNewHeader
                  ? {
                      background: "transparent !important",
                    }
                  : {
                      backgroundColor: first,
                    }),
                ...(subTitle && {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "8px",
                }),
                [theme.breakpoints.down("md")]: {
                  padding: "12px 16px",
                },
              }}
            >
              {newTitle ? (
                <Box
                  sx={{
                    whiteSpace: "pre",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    width: "calc(100% - 40px)",
                  }}
                >
                  {title}
                </Box>
              ) : (
                <>{title}</>
              )}{" "}
              {subTitle ? (
                <Typography
                  noWrap
                  sx={{
                    maxWidth: "calc(100% - 90px)",
                    fontSize: "20px",
                    fontWeight: "700",
                    lineHeight: "24px",
                    color: third,
                    backgroundColor: first,
                  }}
                >
                  {subTitle}
                </Typography>
              ) : (
                <></>
              )}
            </DialogTitle>
          )}

          <Box
            sx={{
              position: "absolute",
              top: isBluryModel ? "20px" : "13px",
              zIndex: "999",
              right: "16px",
              display: "flex",
              ...(cancelText
                ? {
                    fontWeight: "700",
                    fontSize: "18px",
                    lineHeight: "20px",
                    cursor: "pointer",
                  }
                : {}),
              "& svg": {
                transition: "0.2s ease-in-out",
                cursor: "pointer",
                color: third,
              },
              "&:hover": {
                "& svg": {
                  transform: "rotate(180deg)",
                },
              },
            }}
            onClick={handleClose}
          >
            {cancelText ? (
              cancelText
            ) : (
              <Icon icon="ic:baseline-close" width="24" height="24" />
            )}
          </Box>
        </Box>

        <DialogContent
          sx={{
            padding: tabs ? "0 !important" : "16px  !important",
            scrollBehavior: "smooth",
            backgroundColor: first,
            overflow: hideScroll ? "hidden" : "auto",
          }}
          className="common-scroll"
        >
          {content}
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default CommonModal;
