import React from 'react';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import Button from '../common/Button';
import styles from './ProjectCard.module.css';

const MemberStack = ({ colors, total }) => (
  <div className={styles.memberStack}>
    {colors.slice(0, 3).map((color, i) => (
      <div
        key={i}
        className={styles.memberAvatar}
        style={{ background: color }}
      />
    ))}
    <span className={styles.memberCount}>{total} учасників</span>
  </div>
);

const ProjectCard = ({ project, view = 'grid', onToggleJoin, onNavigate }) => {
  const isList = view === 'list';
  const { icon, iconBg, title, desc, status, statusLabel, members, memberColors, progress, due, joined } = project;

  const handleJoin = (e) => {
    e.stopPropagation();
    onToggleJoin && onToggleJoin(project.id);
  };

  const handleOpen = (e) => {
    e.stopPropagation();
    onNavigate && onNavigate('project-detail', project);
  };

  if (isList) {
    return (
      <div className={`${styles.card} ${styles.listCard}`} onClick={handleOpen} style={{ cursor: 'pointer' }}>
        <div className={styles.iconBox} style={{ background: iconBg }}>{icon}</div>

        <div className={styles.body}>
          <div className={styles.topRow}>
            <span className={styles.title}>{title}</span>
            <Badge status={status} dot>{statusLabel}</Badge>
          </div>
          <p className={styles.desc} style={{ marginBottom: 10 }}>{desc}</p>
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>{due}</span>
            <span className={styles.metaItem}>{members} учасників</span>
            <span className={styles.categoryTag}>{project.category}</span>
            {joined && <span className={styles.joinedTag}>✓ Приєднано</span>}
          </div>
        </div>

        <div className={styles.listRight}>
          <div style={{ width: 140 }}>
            <ProgressBar value={progress} status={status} />
          </div>
          {joined ? (
            <Button variant="outline" sm onClick={handleOpen}>
              Відкрити проєкт
            </Button>
          ) : (
            <Button variant="outline" sm onClick={handleJoin}>
              Приєднатись
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card} onClick={handleOpen} style={{ cursor: 'pointer' }}>
      <div className={styles.cardTop}>
        <div className={styles.iconBox} style={{ background: iconBg, marginBottom: 0 }}>{icon}</div>
        <Badge status={status} dot>{statusLabel}</Badge>
      </div>

      <p className={styles.title}>{title}</p>
      <p className={styles.desc}>{desc}</p>

      <ProgressBar value={progress} status={status} />

      <div className={styles.footer}>
        <div className={styles.metaRow}>
          <span className={styles.metaItem}>{due}</span>
          <MemberStack colors={memberColors} total={members} />
        </div>
        {joined && <span className={styles.joinedTag}>✓ Приєднано</span>}
      </div>

      <div style={{ marginTop: 12 }}>
        {joined ? (
          <Button
            variant="outline"
            sm
            onClick={handleOpen}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Відкрити проєкт
          </Button>
        ) : (
          <Button
            variant="primary"
            sm
            onClick={handleJoin}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Приєднатись
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
