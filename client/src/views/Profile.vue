<template>
  <div class="profile-page">
    <div class="page-header">
      <div class="container">
        <h1>👤 个人中心</h1>
        <p>管理你的个人信息和偏好设置</p>
      </div>
    </div>
    
    <div class="container">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="基本信息" name="basic">
          <div class="form-wrap card">
            <div class="profile-top mb-20">
              <div class="avatar-edit">
                <img :src="form.avatar" class="avatar-xl" />
                <el-button size="small" type="primary" @click="randomAvatar">换一个</el-button>
              </div>
              <div class="quick-stats">
                <div class="stat">
                  <span class="num">{{ stats?.totalCount || 0 }}</span>
                  <span class="label">打卡次数</span>
                </div>
                <div class="stat">
                  <span class="num">{{ stats?.totalHours || 0 }}</span>
                  <span class="label">练琴小时</span>
                </div>
                <div class="stat">
                  <span class="num">{{ myInstruments.length }}</span>
                  <span class="label">发布乐器</span>
                </div>
                <div class="stat">
                  <span class="num highlight">{{ form.rating }}</span>
                  <span class="label">信用评分</span>
                </div>
              </div>
            </div>
            
            <el-form :model="form" label-width="100px">
              <el-form-item label="昵称">
                <el-input v-model="form.username" style="max-width: 300px" />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="form.phone" style="max-width: 250px" />
              </el-form-item>
              <el-form-item label="所在城市">
                <el-input v-model="form.city" placeholder="如：北京市" style="max-width: 200px" />
                <el-input v-model="form.district" placeholder="如：海淀区" style="max-width: 200px; margin-left: 10px" />
              </el-form-item>
              <el-form-item label="水平等级">
                <el-radio-group v-model="form.skillLevel">
                  <el-radio value="初级">初级</el-radio>
                  <el-radio value="中级">中级</el-radio>
                  <el-radio value="高级">高级</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="个人简介">
                <el-input v-model="form.bio" type="textarea" :rows="3" style="max-width: 500px" placeholder="介绍一下自己吧..." />
              </el-form-item>
              <el-form-item label="擅长乐器">
                <el-select
                  v-model="form.instruments"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="选择或输入乐器"
                  style="max-width: 500px"
                >
                  <el-option v-for="inst in allInstruments" :key="inst" :label="inst" :value="inst" />
                </el-select>
              </el-form-item>
              <el-form-item label="喜欢的曲目">
                <el-select
                  v-model="form.favoritePieces"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="选择或输入曲目"
                  style="max-width: 500px"
                >
                  <el-option v-for="p in commonPieces" :key="p" :label="p" :value="p" />
                </el-select>
              </el-form-item>
              <el-form-item label="空闲时间">
                <el-checkbox-group v-model="form.freeTimes">
                  <el-checkbox label="工作日白天" />
                  <el-checkbox label="工作日晚上" />
                  <el-checkbox label="周六上午" />
                  <el-checkbox label="周六下午" />
                  <el-checkbox label="周六晚上" />
                  <el-checkbox label="周日上午" />
                  <el-checkbox label="周日下午" />
                  <el-checkbox label="周日晚上" />
                  <el-checkbox label="每天早晨" />
                </el-checkbox-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="large" :loading="saving" @click="saveProfile">
                  <el-icon><Check /></el-icon>
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="我的乐器" name="instruments">
          <div class="action-bar mb-20">
            <router-link to="/publish">
              <el-button type="primary" size="large">
                <el-icon><Plus /></el-icon>
                发布新乐器
              </el-button>
            </router-link>
          </div>
          <div v-if="myInstruments.length" class="grid grid-4 gap-20">
            <div v-for="inst in myInstruments" :key="inst.id" class="inst-item card">
              <img :src="inst.image" class="inst-image" />
              <div class="inst-info">
                <h4>{{ inst.name }}</h4>
                <div class="inst-tags">
                  <span class="badge badge-primary">{{ inst.category }}</span>
                  <span class="badge" :class="inst.status === 'available' ? 'badge-success' : 'badge-warning'">
                    {{ inst.status === 'available' ? '可借用' : '借用中' }}
                  </span>
                </div>
                <div class="inst-price">¥{{ inst.dailyFee }}/天 · 押金¥{{ inst.deposit }}</div>
                <div class="inst-actions">
                  <router-link :to="`/instruments/${inst.id}`">
                    <el-button size="small">查看</el-button>
                  </router-link>
                  <el-button size="small" type="danger" @click="deleteInstrument(inst)">下架</el-button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon><Goods /></el-icon>
            <p>你还没有发布任何乐器</p>
            <router-link to="/publish" class="btn-primary mt-20">去发布我的第一件闲置乐器</router-link>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="我的评价" name="reviews">
          <div class="rating-summary card mb-20">
            <div class="rating-main">
              <span class="rating-num">{{ form.rating }}</span>
              <el-rate v-model="form.rating" disabled show-score text-color="#ff9900" />
              <span class="review-count">（{{ form.reviewCount }}条评价）</span>
            </div>
          </div>
          <div v-if="myReviews.length" class="review-list">
            <div class="review-item card" v-for="r in myReviews" :key="r.id">
              <img :src="r.reviewer?.avatar" class="avatar-sm" />
              <div class="review-body">
                <div class="review-header">
                  <span class="reviewer">{{ r.reviewer?.username }}</span>
                  <el-rate v-model="r.rating" disabled size="small" />
                  <span class="badge badge-primary">{{ r.context }}</span>
                  <span class="time">{{ new Date(r.createdAt).toLocaleDateString() }}</span>
                </div>
                <p>{{ r.content }}</p>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon><ChatLineSquare /></el-icon>
            <p>暂无评价</p>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="我的收藏" name="favorites">
          <div class="fav-stats-bar mb-20">
            <el-tag type="warning" effect="light">
              <el-icon><Star /></el-icon>
              共收藏 {{ myFavorites.length }} 件乐器
            </el-tag>
            <el-tag v-if="availableCount > 0" type="success" effect="light">
              可借用 {{ availableCount }} 件
            </el-tag>
            <el-tag v-if="borrowedCount > 0" type="info" effect="light">
              借用中 {{ borrowedCount }} 件
            </el-tag>
            <el-tag v-if="offlineCount > 0" type="danger" effect="light">
              不可用 {{ offlineCount }} 件
            </el-tag>
          </div>
          <div v-if="myFavorites.length" class="fav-list">
            <div 
              v-for="fav in myFavorites" 
              :key="fav.id" 
              class="fav-item card"
              :class="{ 'is-unavailable': fav.instrumentStatus !== 'available' && fav.instrumentStatus !== 'deleted' }"
            >
              <div class="fav-image-wrap" @click="fav.instrument && router.push(`/instruments/${fav.instrumentId}`)">
                <img 
                  v-if="fav.instrument" 
                  :src="fav.instrument.image" 
                  class="fav-image"
                  :class="{ 'img-disabled': fav.instrumentStatus === 'borrowed' || fav.instrumentStatus === 'offline' || fav.instrumentStatus === 'unavailable' }"
                />
                <div v-else class="fav-image deleted-placeholder">
                  <el-icon :size="40"><Delete /></el-icon>
                  <span>乐器已删除</span>
                </div>
                <span 
                  class="fav-status-tag"
                  :class="{
                    'status-available': fav.instrumentStatus === 'available',
                    'status-borrowed': fav.instrumentStatus === 'borrowed',
                    'status-offline': fav.instrumentStatus === 'offline' || fav.instrumentStatus === 'unavailable',
                    'status-deleted': fav.instrumentStatus === 'deleted'
                  }"
                >
                  {{ fav.statusText }}
                </span>
              </div>
              <div class="fav-info">
                <div class="fav-title-row">
                  <h4 
                    class="fav-name"
                    :class="{ 'text-disabled': !fav.instrument }"
                    @click="fav.instrument && router.push(`/instruments/${fav.instrumentId}`)"
                  >
                    {{ fav.instrument?.name || '该乐器已被删除' }}
                  </h4>
                  <el-button 
                    type="danger" 
                    text 
                    size="small"
                    @click="removeFavorite(fav)"
                  >
                    <el-icon><Delete /></el-icon>
                    取消收藏
                  </el-button>
                </div>
                <div v-if="fav.instrument" class="fav-tags">
                  <span class="badge badge-primary">{{ fav.instrument.category }}</span>
                  <span class="badge badge-level">{{ fav.instrument.level }}</span>
                  <span class="badge badge-condition">{{ fav.instrument.condition }}</span>
                </div>
                <div v-if="fav.instrument" class="fav-price">
                  <span class="daily-fee">¥{{ fav.instrument.dailyFee }}<small>/天</small></span>
                  <span class="deposit">押金 ¥{{ fav.instrument.deposit }}</span>
                </div>
                <div v-if="fav.instrument?.owner" class="fav-owner">
                  <img :src="fav.instrument.owner.avatar" class="avatar-xs" />
                  <span>{{ fav.instrument.owner.username }}</span>
                  <span class="owner-rating">
                    <el-icon><Star /></el-icon>
                    {{ fav.instrument.owner.rating }}
                  </span>
                </div>
                <div v-if="fav.instrument" class="fav-location">
                  <el-icon><Location /></el-icon>
                  {{ fav.instrument.location }}
                </div>
                <div v-if="fav.activeBorrow" class="borrow-alert">
                  <el-icon><WarningFilled /></el-icon>
                  当前借用至 {{ fav.activeBorrow.endDate }}
                </div>
                <div v-if="fav.instrument" class="fav-footer">
                  <span class="fav-time">
                    <el-icon><Clock /></el-icon>
                    收藏于 {{ new Date(fav.createdAt).toLocaleDateString() }}
                  </span>
                  <div class="fav-actions">
                    <el-button 
                      type="primary" 
                      size="small"
                      :disabled="fav.instrumentStatus !== 'available'"
                      @click="router.push(`/instruments/${fav.instrumentId}`)"
                    >
                      {{ fav.instrumentStatus === 'available' ? '立即查看' : '暂不可借' }}
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon><Star /></el-icon>
            <p>还没有收藏任何乐器</p>
            <router-link to="/instruments" class="btn-primary mt-20">去发现喜欢的乐器</router-link>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { checkinApi, instrumentApi, reviewApi, favoriteApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Plus, Goods, ChatLineSquare, Star, Delete, Location, WarningFilled, Clock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('basic')
const saving = ref(false)
const stats = ref(null)
const myInstruments = ref([])
const myReviews = ref([])
const myFavorites = ref([])

const availableCount = computed(() => myFavorites.value.filter(f => f.instrumentStatus === 'available').length)
const borrowedCount = computed(() => myFavorites.value.filter(f => f.instrumentStatus === 'borrowed').length)
const offlineCount = computed(() => myFavorites.value.filter(f => f.instrumentStatus !== 'available' && f.instrumentStatus !== 'borrowed').length)

const form = reactive({
  ...(userStore.currentUser || {}),
  instruments: [],
  favoritePieces: [],
  freeTimes: []
})

const allInstruments = ['古典吉他', '民谣吉他', '电吉他', '尤克里里', '钢琴', '电子琴', '小提琴', '中提琴', '大提琴', '架子鼓', '卡洪鼓', '竹笛', '长笛', '洞箫', '陶埙', '口琴', '萨克斯', '小号', '古筝', '二胡', '琵琶', '阮', '扬琴']
const commonPieces = ['爱的罗曼史', '阿尔罕布拉宫的回忆', '肖邦夜曲', '梦中的婚礼', '小星星变奏曲', '铃木小提琴教程', 'Take Five', '西班牙斗牛曲', '姑苏行', '平湖秋月', '卡农', '天空之城', '千与千寻', '菊次郎的夏天']

const loadFavorites = async () => {
  try {
    myFavorites.value = await favoriteApi.listByUser(userStore.userId)
  } catch (e) {}
}

onMounted(async () => {
  if (userStore.currentUser) {
    Object.assign(form, userStore.currentUser)
  }
  try {
    stats.value = await checkinApi.stats(userStore.userId)
  } catch (e) {}
  try {
    myInstruments.value = await instrumentApi.list({ ownerId: userStore.userId })
  } catch (e) {}
  try {
    myReviews.value = await reviewApi.list({ revieweeId: userStore.userId })
  } catch (e) {}
  await loadFavorites()
})

const removeFavorite = async (fav) => {
  try {
    await ElMessageBox.confirm(`确定取消收藏「${fav.instrument?.name || '该乐器'}」吗？`, '确认取消', { type: 'warning' })
  } catch { return }
  try {
    await favoriteApi.remove(fav.instrumentId)
    ElMessage.success('已取消收藏')
    myFavorites.value = myFavorites.value.filter(f => f.id !== fav.id)
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const randomAvatar = () => {
  const seed = Math.random().toString(36).slice(2, 10)
  form.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
}

const saveProfile = async () => {
  if (!form.username) {
    ElMessage.warning('请填写昵称')
    return
  }
  saving.value = true
  try {
    const result = await userStore.updateUser({ ...form })
    if (result.success) {
      ElMessage.success('保存成功！')
    }
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const deleteInstrument = async (inst) => {
  try {
    await ElMessageBox.confirm(`确定下架「${inst.name}」吗？`, '确认下架', { type: 'warning' })
  } catch { return }
  try {
    await instrumentApi.remove(inst.id)
    ElMessage.success('已下架')
    myInstruments.value = myInstruments.value.filter(i => i.id !== inst.id)
  } catch (e) {
    ElMessage.error('操作失败')
  }
}
</script>

<style scoped>
.mb-20 { margin-bottom: 20px; }
.mt-20 { display: inline-block; margin-top: 20px; }

.form-wrap {
  padding: 30px 40px;
  max-width: 900px;
  margin: 0 auto;
}

.profile-top {
  display: flex;
  gap: 40px;
  padding-bottom: 24px;
  border-bottom: 1px dashed var(--border-color);
}

.avatar-edit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar-xl {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #e0e7ff;
}

.quick-stats {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  align-content: center;
}

.stat {
  text-align: center;
  padding: 16px;
  background: var(--bg-light);
  border-radius: 12px;
}

.stat .num {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat .num.highlight {
  color: #f59e0b;
}

.stat .label {
  font-size: 12px;
  color: var(--text-secondary);
}

.action-bar {
  padding: 4px;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.inst-item {
  overflow: hidden;
  padding: 0;
}

.inst-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.inst-info {
  padding: 14px;
}

.inst-info h4 {
  font-size: 15px;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inst-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.inst-price {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.inst-actions {
  display: flex;
  gap: 8px;
}

.rating-summary {
  padding: 30px;
  text-align: center;
}

.rating-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.rating-num {
  font-size: 48px;
  font-weight: 700;
  color: #f59e0b;
}

.review-count {
  color: var(--text-secondary);
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.review-item {
  display: flex;
  gap: 12px;
  padding: 18px;
}

.review-body {
  flex: 1;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.reviewer {
  font-weight: 500;
}

.time {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-secondary);
}

.fav-stats-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.fav-stats-bar .el-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  font-size: 13px;
}

.fav-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fav-item {
  display: flex;
  gap: 20px;
  padding: 0;
  overflow: hidden;
  transition: all 0.3s;
}

.fav-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.fav-item.is-unavailable {
  opacity: 0.85;
}

.fav-image-wrap {
  position: relative;
  width: 220px;
  min-width: 220px;
  cursor: pointer;
}

.fav-image {
  width: 100%;
  height: 100%;
  min-height: 180px;
  object-fit: cover;
  transition: opacity 0.3s;
}

.fav-image.img-disabled {
  opacity: 0.5;
  filter: grayscale(0.3);
}

.fav-image.deleted-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 13px;
}

.fav-status-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.fav-status-tag.status-available {
  background: #10b981;
}

.fav-status-tag.status-borrowed {
  background: #3b82f6;
}

.fav-status-tag.status-offline {
  background: #6b7280;
}

.fav-status-tag.status-deleted {
  background: #ef4444;
}

.fav-info {
  flex: 1;
  padding: 16px 20px 16px 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.fav-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.fav-name {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  cursor: pointer;
  transition: color 0.2s;
  flex: 1;
}

.fav-name:hover {
  color: var(--primary-color);
}

.fav-name.text-disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.fav-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.badge-level {
  background: #fef3c7;
  color: #b45309;
}

.badge-condition {
  background: #dbeafe;
  color: #1d4ed8;
}

.fav-price {
  display: flex;
  gap: 16px;
  align-items: baseline;
  margin-bottom: 10px;
}

.fav-price .daily-fee {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-color);
}

.fav-price .daily-fee small {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-secondary);
}

.fav-price .deposit {
  font-size: 13px;
  color: var(--text-secondary);
}

.fav-owner,
.fav-location,
.fav-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.avatar-xs {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.owner-rating {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #f59e0b;
}

.borrow-alert {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 6px;
  font-size: 12px;
  margin: 8px 0;
  width: fit-content;
}

.fav-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 10px;
}

.fav-time {
  margin-bottom: 0;
}

.fav-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 900px) {
  .profile-top {
    flex-direction: column;
    align-items: center;
  }
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
    width: 100%;
  }
  .grid-4 {
    grid-template-columns: 1fr 1fr;
  }
  .fav-item {
    flex-direction: column;
    gap: 0;
  }
  .fav-image-wrap {
    width: 100%;
    min-width: auto;
    height: 200px;
  }
  .fav-image {
    min-height: 200px;
  }
  .fav-info {
    padding: 16px 20px;
  }
}
</style>
